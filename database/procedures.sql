--

DROP PROCEDURE IF EXISTS all_tickets;
DELIMITER ;;

CREATE PROCEDURE all_tickets ()
BEGIN

    SELECT 
        * from tickets;
END;;

DELIMITER ;

DROP PROCEDURE IF EXISTS make_ticket;
DELIMITER ;;

CREATE PROCEDURE make_ticket(
    t_person VARCHAR(50),
    t_issue_choice VARCHAR(20),
    t_issue_explain VARCHAR(1000),
    t_file_path VARCHAR(255),
    t_user_email VARCHAR(255)
)
BEGIN
    INSERT INTO tickets (person, issue_choice, issue_explain, file_path, user_email)
    VALUES (t_person, t_issue_choice, t_issue_explain, t_file_path, t_user_email);
end;;

DELIMITER ;