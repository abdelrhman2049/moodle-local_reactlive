<?php
namespace local_reactlive\external;

defined('MOODLE_INTERNAL') || die();

use core_external\external_api;
use core_external\external_function_parameters;
use core_external\external_single_structure;
use core_external\external_multiple_structure;
use core_external\external_value;
use core_course_list_element;
use moodle_url;

class get_student_data extends external_api {

    private const SUGGESTED_LIMIT = 6;
    private const SUGGESTED_REWARD = 150;

    public static function execute_parameters() {
        return new external_function_parameters([
            'userid' => new external_value(PARAM_INT, 'User ID', VALUE_DEFAULT, 0)
        ]);
    }

    private static function activity_structure() {
        return new external_single_structure([
            'id' => new external_value(PARAM_INT, 'Course module id'),
            'name' => new external_value(PARAM_RAW, 'Activity name'),
            'modname' => new external_value(PARAM_TEXT, 'Module name'),
            'url' => new external_value(PARAM_RAW, 'Activity url'),
            'date' => new external_value(PARAM_RAW, 'Date label')
        ]);
    }

    public static function execute_returns() {
        return new external_single_structure([
            'user' => new external_single_structure([
                'fullname' => new external_value(PARAM_RAW, 'Full name'),
                'firstname' => new external_value(PARAM_RAW, 'First name'),
                'avatar' => new external_value(PARAM_RAW, 'Avatar url'),
                'coins' => new external_value(PARAM_INT, 'Coins'),
                'level' => new external_value(PARAM_INT, 'Level'),
                'completed_activities' => new external_value(PARAM_INT, 'Completed activities')
            ]),
            'courses' => new external_multiple_structure(
                new external_single_structure([
                    'id' => new external_value(PARAM_INT, 'Course id'),
                    'fullname' => new external_value(PARAM_RAW, 'Course full name'),
                    'shortname' => new external_value(PARAM_RAW, 'Course short name'),
                    'courseimage' => new external_value(PARAM_RAW, 'Course image url'),
                    'progress' => new external_value(PARAM_INT, 'Progress percent'),
                    'done_count' => new external_value(PARAM_INT, 'Done count'),
                    'todo_count' => new external_value(PARAM_INT, 'Todo count'),
                    'enrolled_since' => new external_value(PARAM_RAW, 'Enrolment date'),
                    'time_spent' => new external_value(PARAM_RAW, 'Time spent'),
                    'grade' => new external_value(PARAM_RAW, 'Grade'),
                    'done_list' => new external_multiple_structure(self::activity_structure()),
                    'todo_list' => new external_multiple_structure(self::activity_structure())
                ])
            ),
            'suggested' => new external_multiple_structure(
                new external_single_structure([
                    'id' => new external_value(PARAM_INT, 'Course id'),
                    'fullname' => new external_value(PARAM_RAW, 'Course full name'),
                    'category' => new external_value(PARAM_RAW, 'Category'),
                    'summary' => new external_value(PARAM_RAW, 'Summary'),
                    'reward_coins' => new external_value(PARAM_INT, 'Reward coins'),
                    'enrolurl' => new external_value(PARAM_RAW, 'Enrol url'),
                    'courseimage' => new external_value(PARAM_RAW, 'Course image url')
                ])
            )
        ]);
    }

    private static function get_course_image($course) {
        $courseinlist = new core_course_list_element($course);
        foreach ($courseinlist->get_course_overviewfiles() as $file) {
            if ($file->is_valid_image()) {
                return moodle_url::make_pluginfile_url(
                    $file->get_contextid(),
                    $file->get_component(),
                    $file->get_filearea(),
                    null,
                    $file->get_filepath(),
                    $file->get_filename()
                )->out();
            }
        }
        return '';
    }

    private static function get_summary($course) {
        $context = \context_course::instance($course->id);
        $html = format_text($course->summary, $course->summaryformat, ['context' => $context]);
        $text = trim(shorten_text(html_to_text($html, 0, false), 140));
        return $text !== '' ? $text : 'Join this course and start learning today.';
    }

    private static function get_suggested_courses(array $enrolledcourses) {
        global $DB;

        $courses = $DB->get_records_select(
            'course',
            'id <> :siteid AND visible = 1',
            ['siteid' => SITEID],
            'sortorder ASC'
        );

        $suggested = [];

        foreach ($courses as $course) {
            if (count($suggested) >= self::SUGGESTED_LIMIT) {
                break;
            }
            if (isset($enrolledcourses[$course->id])) {
                continue;
            }
            if (!\core_course_category::can_view_course_info($course)) {
                continue;
            }

            $category = \core_course_category::get($course->category, IGNORE_MISSING);
            $enrolurl = new moodle_url('/enrol/index.php', ['id' => $course->id]);

            $suggested[] = [
                'id' => (int)$course->id,
                'fullname' => (string)$course->fullname,
                'category' => $category ? (string)$category->get_formatted_name() : 'General',
                'summary' => self::get_summary($course),
                'reward_coins' => self::SUGGESTED_REWARD,
                'enrolurl' => $enrolurl->out(false),
                'courseimage' => self::get_course_image($course)
            ];
        }

        return $suggested;
    }

    public static function execute($userid = 0) {
        global $USER, $DB, $CFG;

        require_once($CFG->dirroot . '/course/lib.php');
        require_once($CFG->libdir . '/completionlib.php');
        require_once($CFG->libdir . '/enrollib.php');

        $params = self::validate_parameters(self::execute_parameters(), ['userid' => $userid]);
        $userid = $params['userid'];

        if (empty($userid)) {
            $userid = $USER->id;
        }

        self::validate_context(\context_system::instance());

        // شرط الحماية يجب أن يكون هنا قبل البدء في جلب أي بيانات
        if ($USER->id != $userid) {
            throw new \moodle_exception('accessdenied', 'admin');
        }

        $userdp = new moodle_url('/user/pix.php/' . $userid . '/f1.jpg');

        $userdata = [
            'fullname' => fullname($USER),
            'firstname' => $USER->firstname,
            'avatar' => $userdp->out(false),
            'coins' => 0,
            'level' => 1,
            'completed_activities' => 0
        ];

        $coursesdata = [];
        $enrolledcourses = enrol_get_users_courses($userid, true);
        $totalcoins = 0;
        $totalcompleted = 0;

        foreach ($enrolledcourses as $course) {
            $completion = new \completion_info($course);
            $modinfo = get_fast_modinfo($course->id);
            $cms = $modinfo->get_cms();

            $donecount = 0;
            $todocount = 0;
            $totalacts = 0;
            $donelist = [];
            $todolist = [];

            foreach ($cms as $cm) {
                if (!$cm->uservisible) {
                    continue;
                }

                $hascompletion = ($cm->completion != COMPLETION_TRACKING_NONE);
                $isdueactivity = in_array($cm->modname, ['quiz', 'assign']);

                if (!$hascompletion && !$isdueactivity) {
                    continue;
                }

                $totalacts++;
                $actdata = $completion->get_data($cm, false, $userid);
                $url = new moodle_url('/mod/' . $cm->modname . '/view.php', ['id' => $cm->id]);

                $item = [
                    'id' => (int)$cm->id,
                    'name' => (string)$cm->name,
                    'modname' => (string)$cm->modname,
                    'url' => $url->out(false),
                    'date' => ''
                ];

                $iscomplete = $hascompletion && in_array(
                        (int)$actdata->completionstate,
                        [COMPLETION_COMPLETE, COMPLETION_COMPLETE_PASS]
                    );

                if ($iscomplete) {
                    $item['date'] = !empty($actdata->timecompleted)
                        ? userdate($actdata->timecompleted, '%d %b %Y')
                        : 'Completed';
                    $donelist[] = $item;
                    $donecount++;
                    continue;
                }

                $duedate = 0;

                $eventdate = $DB->get_field_sql("
                    SELECT MIN(timesort)
                    FROM {event}
                    WHERE modulename = :modname
                      AND instance = :instance
                      AND eventtype IN ('due', 'close')
                ", ['modname' => $cm->modname, 'instance' => $cm->instance]);

                if (!empty($eventdate)) {
                    $duedate = (int)$eventdate;
                }

                if (empty($duedate)) {
                    $expected = $DB->get_field('course_modules', 'completionexpected', ['id' => $cm->id]);
                    if (!empty($expected)) {
                        $duedate = (int)$expected;
                    }
                }

                if (empty($duedate) && $cm->modname === 'quiz') {
                    $duedate = (int)$DB->get_field('quiz', 'timeclose', ['id' => $cm->instance]);
                }

                if (empty($duedate) && $cm->modname === 'assign') {
                    $duedate = (int)$DB->get_field('assign', 'duedate', ['id' => $cm->instance]);
                }

                $item['date'] = ($duedate > 0) ? userdate($duedate, '%d %b %Y, %I:%M %p') : 'No due date';

                $todolist[] = $item;
                $todocount++;
            }

            $progress = ($totalacts > 0) ? (int)round(($donecount / $totalacts) * 100) : 0;

            $enroltime = $DB->get_field_sql(
                "SELECT MIN(ue.timecreated)
                   FROM {user_enrolments} ue
                   JOIN {enrol} e ON e.id = ue.enrolid
                  WHERE e.courseid = :courseid AND ue.userid = :userid",
                ['courseid' => $course->id, 'userid' => $userid]
            );
            $enrolledsince = $enroltime ? userdate($enroltime, '%d %b %Y') : '-';

            $clicks = (int)$DB->get_field_sql(
                "SELECT COUNT(id)
                   FROM {logstore_standard_log}
                  WHERE courseid = :courseid AND userid = :userid",
                ['courseid' => $course->id, 'userid' => $userid]
            );

            $estimatedminutes = $clicks * 5;
            $timespent = floor($estimatedminutes / 60) . 'h ' . ($estimatedminutes % 60) . 'm';

            $coursesdata[] = [
                'id' => (int)$course->id,
                'fullname' => (string)$course->fullname,
                'shortname' => (string)$course->shortname,
                'courseimage' => self::get_course_image($course),
                'progress' => $progress,
                'done_count' => $donecount,
                'todo_count' => $todocount,
                'enrolled_since' => $enrolledsince,
                'time_spent' => $timespent,
                'grade' => 'N/A',
                'done_list' => $donelist,
                'todo_list' => $todolist
            ];

            $totalcompleted += $donecount;
            $totalcoins += ($progress * 5);
        }

        $userdata['coins'] = (int)$totalcoins;
        $userdata['completed_activities'] = (int)$totalcompleted;
        $userdata['level'] = (int)floor($totalcompleted / 10) + 1;

        return [
            'user' => $userdata,
            'courses' => $coursesdata,
            'suggested' => self::get_suggested_courses($enrolledcourses)
        ];
    }
}