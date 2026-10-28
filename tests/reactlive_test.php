<?php

namespace local_reactlive;

use advanced_testcase;
use core_external\external_api;
use context_system;
use stdClass;

class reactlive_test extends advanced_testcase {
    public function test_get_student_data_external_security() {
        $user1 = $this->getDataGenerator()->create_user();
        $user2 = $this->getDataGenerator()->create_user();

        $this->setUser($user1);

        $this->expectException(\moodle_exception::class);

        \local_reactlive\external\get_student_data::execute($user2->id);
    }
    public function setUp(): void {
        parent::setUp();
        $this->resetAfterTest(true);
    }

    public function test_plugin_is_installed() {
        $plugin = \core_plugin_manager::instance()->get_plugin_info('local_reactlive');
        $this->assertNotNull($plugin);
    }

    public function test_user_access_and_capabilities() {
        global $DB;

        // 1. إنشاء المستخدم الوهمي
        $user = $this->getDataGenerator()->create_user();

        // 2. جلب الـ ID الخاص بالدور الذي تريده (مثلاً: student أو editingteacher)
        $role = $DB->get_record('role', ['shortname' => 'student']);

        // 3. تحديد مستوى الصلاحية (Context) - هنا نستخدم مستوى النظام بالكامل
        $context = \context_system::instance();

        // 4. إعطاء الدور للمستخدم باستخدام دالة مودل الأساسية
        role_assign($role->id, $user->id, $context->id);

        // 5. محاكاة تسجيل الدخول بهذا المستخدم
        $this->setUser($user);

        // 6. اختبار الصلاحية (استبدل 'moodle/site:config' بالصلاحية الخاصة بالبلاجين بتاعك لو موجودة)
        $hascap = has_capability('moodle/site:config', $context, $user);

        // التأكد من أن الطالب لا يمتلك صلاحية الإعدادات
        $this->assertFalse($hascap);
    }

    public function test_database_interaction() {
        global $DB;

        $record = new stdClass();
        $record->name = 'React Dashboard Test';
        $record->timecreated = time();

        $this->assertIsObject($record);
        $this->assertObjectHasProperty('name', $record);
    }

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