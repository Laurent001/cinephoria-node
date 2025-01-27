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
 
END

CREATE TRIGGER before_booking_seat_insert BEFORE 
INSERT 
	ON booking_seat FOR EACH ROW 
BEGIN DECLARE seats_already_taken INT; 
 
-- Vérifie si des sièges sont déjà pris pour ce screening 
SELECT 
	COUNT(*) INTO seats_already_taken 
FROM 
	booking b 
	JOIN booking_seat bs ON b.id = bs.booking_id 
WHERE 
	b.screening_id = ( 
		SELECT 
			screening_id 
		FROM 
			booking 
		WHERE 
			id = NEW.booking_id 
	) 
	AND bs.seat_id = NEW.seat_id; 
 
IF seats_already_taken > 0 THEN 
SIGNAL SQLSTATE '45000' 
SET 
	MESSAGE_TEXT = 'Un ou plusieurs sièges sont déjà réservés pour ce screening'; 
 
END IF; 
 
END;