<?php
/**
 * Library functions for local_reactlive.
 *
 * @package    local_reactlive
 * @copyright  2026 Abdelrhman
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

/**
 * Extend navigation.
 *
 * @param global_navigation $navigation The navigation object.
 */
function local_reactlive_extend_navigation(global_navigation $navigation) {
    global $USER, $SESSION, $PAGE;

    if (isloggedin() && !isguestuser() && !is_siteadmin()) {
        if (empty($SESSION->local_reactlive_redirect_done)) {
            $SESSION->local_reactlive_redirect_done = true;
            redirect(new moodle_url('/local/reactlive/index.php'));
        }

        if ($PAGE->pagetype === 'my-index') {
            redirect(new moodle_url('/local/reactlive/index.php'));
        }

        $myhome = $navigation->find('myhome', null);
        if ($myhome) {
            $myhome->remove();
        }
    }
}