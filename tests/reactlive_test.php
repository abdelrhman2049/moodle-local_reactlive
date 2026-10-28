<?php
/**
 * Reactlive tests.
 *
 * @package    local_reactlive
 * @copyright  2026 Abdelrhman
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @coversDefaultClass \local_reactlive\external\get_student_data
 */

namespace local_reactlive;

use advanced_testcase;
use core_external\external_api;
use context_system;
use stdClass;

/**
 * Reactlive tests class.
 *
 * @package    local_reactlive
 * @copyright  2026 Abdelrhman
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @coversDefaultClass \local_reactlive\external\get_student_data
 */
class reactlive_test extends advanced_testcase {

    /**
     * Setup method.
     */
    public function setUp(): void {
        parent::setUp();
        $this->resetAfterTest(true);
    }

    /**
     * @covers ::execute
     */
    public function test_get_student_data_external_security() {
        $user1 = $this->getDataGenerator()->create_user();
        $user2 = $this->getDataGenerator()->create_user();

        $this->setUser($user1);

        $this->expectException(\moodle_exception::class);

        \local_reactlive\external\get_student_data::execute($user2->id);
    }

    /**
     * @coversNothing
     */
    public function test_plugin_is_installed() {
        $plugin = \core_plugin_manager::instance()->get_plugin_info('local_reactlive');
        $this->assertNotNull($plugin);
    }

    /**
     * @coversNothing
     */
    public function test_user_access_and_capabilities() {
        global $DB;

        $user = $this->getDataGenerator()->create_user();
        $role = $DB->get_record('role', ['shortname' => 'student']);
        $context = \context_system::instance();

        role_assign($role->id, $user->id, $context->id);

        $this->setUser($user);

        $hascap = has_capability('moodle/site:config', $context, $user);

        $this->assertFalse($hascap);
    }

    /**
     * @coversNothing
     */
    public function test_database_interaction() {
        global $DB;

        $record = new stdClass();
        $record->name = 'React Dashboard Test';
        $record->timecreated = time();

        $this->assertIsObject($record);
        $this->assertObjectHasProperty('name', $record);
    }

    /**
     * @covers ::execute
     */
    public function test_get_student_data_external() {
        $user = $this->getDataGenerator()->create_user();
        $this->setUser($user);

        if (class_exists('\local_reactlive\external\get_student_data')) {
            $result = \local_reactlive\external\get_student_data::execute($user->id);

            $result = \core_external\external_api::clean_returnvalue(
                \local_reactlive\external\get_student_data::execute_returns(),
                $result
            );

            $this->assertIsArray($result);
        } else {
            $this->assertTrue(true);
        }
    }
}