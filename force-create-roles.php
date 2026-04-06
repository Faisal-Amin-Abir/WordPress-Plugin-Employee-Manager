<?php
/**
 * Force Create HR Manager and Employee Viewer Roles - Exact Path Fixed
 */

echo "<h1>🔧 Forcing Role Creation...</h1>";

$wp_load_path = dirname(__DIR__, 3) . '/wp-load.php';   // Go up 3 levels from plugin folder

echo "<p>Looking for wp-load.php at: <strong>" . $wp_load_path . "</strong></p>";

if ( file_exists( $wp_load_path ) ) {
    require_once $wp_load_path;
    echo "<p style='color:green'>✅ wp-load.php loaded successfully.</p>";
} else {
    echo "<p style='color:red'>❌ Could not find wp-load.php at: " . $wp_load_path . "</p>";
    die();
}

// Load Composer autoloader (if exists)
if ( file_exists( __DIR__ . '/vendor/autoload.php' ) ) {
    require_once __DIR__ . '/vendor/autoload.php';
    echo "<p style='color:green'>✅ Composer autoloader loaded.</p>";
}

// Load Capabilities class
$capabilities_file = __DIR__ . '/includes/Core/Capabilities.php';

if ( file_exists( $capabilities_file ) ) {
    require_once $capabilities_file;
    echo "<p style='color:green'>✅ Capabilities.php loaded successfully.</p>";
} else {
    echo "<p style='color:red'>❌ Capabilities.php not found at: " . $capabilities_file . "</p>";
    die();
}

// Create roles
if ( class_exists( 'EmployeeManager\\Core\\Capabilities' ) ) {
    echo "<p style='color:green'>✅ Capabilities class exists.</p>";
    
    EmployeeManager\Core\Capabilities::create_roles();
    
    echo "<h2>✅ Roles creation function has been called.</h2>";
    echo "<p><strong>Now check:</strong> Users → Add New</p>";
    echo "<p>Look for <strong>HR Manager</strong> and <strong>Employee Viewer</strong> in the Role dropdown.</p>";
} else {
    echo "<p style='color:red'>❌ Capabilities class could NOT be loaded.</p>";
}

echo "<hr>";
echo "<p><a href='" . admin_url('users.php') . "'>Go to Users Page</a></p>";