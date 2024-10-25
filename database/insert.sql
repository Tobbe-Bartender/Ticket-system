INSERT INTO issue_categories (name) 
VALUES 
    ('Hardware'),
    ('Software'),
    ('Connection'),
    ('Other');

INSERT INTO knowledge_base (issue_type, solution) 
VALUES 
    ('Hardware - Slow Performance', 
        'If a computer or device is experiencing slow performance, try the following: 
        1. Close unused applications and browser tabs.
        2. Restart the computer to clear memory.
        3. Ensure the device is connected to the power source.
        4. Check for any pending operating system or software updates that may need to be installed.
        5. Run a virus or malware scan to ensure the system is clean.'),
    
    ('Software - Application Crashing', 
        'If an application is crashing frequently, try the following:
        1. Restart the application.
        2. Update the application to the latest version.
        3. Check if the application is compatible with the current operating system.
        4. Clear the application\'s cache and temporary files.
        5. Reinstall the application if the issue persists.'),
    
    ('Connection - Unable to Connect to Wi-Fi', 
        'If you are unable to connect to the Wi-Fi network:
        1. Restart the Wi-Fi router or modem.
        2. Ensure that the Wi-Fi is turned on for the device and airplane mode is disabled.
        3. Check if other devices can connect to the network to identify if the issue is with the network or the device.
        4. Forget the Wi-Fi network and reconnect by entering the password again.
        5. Move closer to the router to ensure there is a strong signal.');
