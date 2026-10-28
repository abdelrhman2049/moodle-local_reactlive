<?php
/**
 * Main index file for local_reactlive.
 *
 * @package    local_reactlive
 * @copyright  2026 Abdelrhman
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require_once(__DIR__ . '/../../config.php');

require_login();

$context = context_system::instance();
require_capability('local/reactlive:view', $context);

$PAGE->set_url(new moodle_url('/local/reactlive/index.php'));$PAGE->set_context($context);$PAGE->set_title(get_string('pluginname', 'local_reactlive'));

echo $OUTPUT->header();
echo $OUTPUT->render_from_template('local_reactlive/app', []);
echo $OUTPUT->footer();