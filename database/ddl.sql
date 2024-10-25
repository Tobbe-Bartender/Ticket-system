--

DROP TABLE IF EXISTS tickets;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS issue_categories;
DROP TABLE IF EXISTS knowledge_base;


CREATE TABLE tickets (
    ticket_id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    person VARCHAR(50) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    issue_choice VARCHAR(20) NOT NULL,
    issue_explain VARCHAR(1000) NOT NULL,
    agent VARCHAR(50) NOT NULL DEFAULT "None",
    status VARCHAR(50) NOT NULL DEFAULT "Created",
    file_path VARCHAR(255),
    time_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    time_last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE comments (
    comment_id INT PRIMARY KEY AUTO_INCREMENT,
    ticket_id INT NOT NULL, 
    comment_text VARCHAR(1000) NOT NULL,
    comment_author VARCHAR(255),
    comment_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id) ON DELETE CASCADE
);

CREATE TABLE issue_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE knowledge_base (
    id INT AUTO_INCREMENT PRIMARY KEY,
    issue_type VARCHAR(1000) NOT NULL,
    solution TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
