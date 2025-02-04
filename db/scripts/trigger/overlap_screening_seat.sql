

CREATE TRIGGER before_insert_booking_screening_seat BEFORE 
INSERT 
	ON booking_screening_seat FOR EACH ROW 
BEGIN DECLARE seats_already_taken INT; 
 
-- Vérifie si des sièges sont déjà pris pour ce screening 
SELECT 
	COUNT(*) INTO seats_already_taken 
FROM 
	booking b 
	JOIN booking_screening_seat bss ON b.id = bss.booking_id 
WHERE 
	bss.screening_id = ( 
		SELECT 
			screening_id 
		FROM 
			booking_screening_seat 
		WHERE 
			id = NEW.booking_id 
	) 
	AND bss.seat_id = NEW.seat_id; 
 
IF seats_already_taken > 0 THEN 
SIGNAL SQLSTATE '45000' 
SET 
	MESSAGE_TEXT = 'Un ou plusieurs sièges sont déjà réservés pour ce screening'; 
 
END IF; 
 
END;