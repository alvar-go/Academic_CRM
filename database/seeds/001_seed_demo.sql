INSERT INTO applicants (full_name, email, program, status, stage, score) VALUES
    ('Camila Torres', 'camila.torres@example.edu', 'Data Science MSc', 'In Review', 'Interview', 89),
    ('Nicolas Mejia', 'nicolas.mejia@example.edu', 'Economics PhD', 'Offer Ready', 'Committee', 94),
    ('Valentina Rueda', 'valentina.rueda@example.edu', 'Public Policy MA', 'Awaiting Documents', 'Document Review', 78);

INSERT INTO advising_tasks (student_name, program, owner, due_date, priority, status) VALUES
    ('Sofia Bernal', 'Law', 'Daniela P.', '2026-04-02', 'High', 'Open'),
    ('Samuel Gomez', 'Engineering', 'Carlos T.', '2026-04-05', 'Medium', 'In Progress'),
    ('Isabela Leon', 'Medicine', 'Luisa M.', '2026-04-07', 'Low', 'Done');
