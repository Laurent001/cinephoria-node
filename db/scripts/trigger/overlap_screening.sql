CREATE TRIGGER before_insert_screening BEFORE 
INSERT 
	ON screening FOR EACH ROW 
BEGIN DECLARE overlap INT; 
 
IF NEW.end_time <= NEW.start_time THEN 
SIGNAL SQLSTATE '45000' 
SET 
	MESSAGE_TEXT = 'End time must be after start time'; 
 
END IF; 
 
SELECT 
	COUNT(*) INTO overlap 
FROM 
	screening 
WHERE 
	auditorium_id = NEW.auditorium_id 
	AND ( 
		(NEW.start_time BETWEEN start_time AND end_time) 
		OR (NEW.end_time BETWEEN start_time AND end_time) 
		OR ( 
			start_time BETWEEN NEW.start_time AND NEW.end_time 
		) 
	); 
 
IF overlap > 0 THEN 
SIGNAL SQLSTATE '45000' 
SET 
	MESSAGE_TEXT = 'Overlapping screening times are not allowed'; 
 
END IF; 
 
END;