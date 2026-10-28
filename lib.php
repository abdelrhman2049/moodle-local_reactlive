<?php
defined('MOODLE_INTERNAL') || die();

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