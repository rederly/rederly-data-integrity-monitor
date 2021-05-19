export interface QueryTest {
    name: string;
    query: string;
    expectedResults: Array<any> | null;
    message: (test: QueryTest, result: Array<any>) => string;
}

const queryTests: Array<QueryTest> = [
    {
        name: 'Total user count',
        query: `
        SELECT
        COUNT(*)
        FROM users;
        `,
        expectedResults: null,
        message: ((_test: QueryTest, result: Array<any>): string => {
            if(result.length !== 1) {
                return `ERROR: Expected 1 row but got ${result.length}`;
            }
            return `Received ${result[0].count}`;
        })
    },
    {
        name: 'Student count',
        query: `
        SELECT
        COUNT(*)
        FROM users
        WHERE role_id = 0;
        `,
        expectedResults: null,
        message: ((_test: QueryTest, result: Array<any>): string => {
            if(result.length !== 1) {
                return `ERROR: Expected 1 row but got ${result.length}`;
            }
            return `Received ${result[0].count}`;
        })
    },
    {
        name: 'Professor count',
        query: `
        SELECT
        COUNT(*)
        FROM users
        WHERE role_id = 1
        AND user_email NOT ILIKE '%rederly.com';
        `,
        expectedResults: null,
        message: ((_test: QueryTest, result: Array<any>): string => {
            if(result.length !== 1) {
                return `ERROR: Expected 1 row but got ${result.length}`;
            }
            return `Received ${result[0].count}`;
        })
    },
    {
        name: 'Paid professor count',
        query: `
        SELECT
        COUNT(*)
        FROM users
        WHERE role_id = 1
        AND user_paid_until > NOW()
        AND user_email NOT ILIKE '%rederly.com';
        `,
        expectedResults: null,
        message: ((_test: QueryTest, result: Array<any>): string => {
            if(result.length !== 1) {
                return `ERROR: Expected 1 row but got ${result.length}`;
            }
            return `Received ${result[0].count}`;
        })
    },
    {
        name: 'Upcoming Exams',
        query: `
        SELECT
        COUNT(*)
        FROM course_topic_content
        WHERE course_topic_content_end_date > NOW() AND course_topic_content_end_date < NOW() + '1 week'::interval AND topic_type_id = 2;
        `,
        expectedResults: null,
        message: ((_test: QueryTest, result: Array<any>): string => {
            if(result.length !== 1) {
                return `ERROR: Expected 1 row but got ${result.length}`;
            }
            return `Received ${result[0].count}`;
        })
    },
    {
        name: 'Missing Grades Count',
        query: `
        SELECT count(*)
        FROM student_enrollment
        INNER JOIN course ON course.course_id = student_enrollment.course_id AND course.course_active
        INNER JOIN course_unit_content ON course_unit_content.course_id = course.course_id AND course_unit_content.course_unit_content_active
        INNER JOIN course_topic_content ON course_topic_content.course_unit_content_id = course_unit_content.course_unit_content_id AND course_topic_content.course_topic_content_active
        INNER JOIN course_topic_question ON course_topic_question.course_topic_content_id = course_topic_content.course_topic_content_id AND course_topic_question.course_topic_question_active
        LEFT JOIN student_grade ON student_grade.course_topic_question_id = course_topic_question.course_topic_question_id AND student_grade.user_id = student_enrollment.user_id AND student_grade.student_grade_active
        WHERE student_grade.student_grade_id IS NULL AND student_enrollment.student_enrollment_drop_date IS NOT NULL
        ;
        `,
        expectedResults: [{
            count: '0'
        }],
        message: ((test: QueryTest, result: Array<any>): string => {
            if(result.length !== 1) {
                return `Expected 1 row but got ${result.length}`;
            }
            return `Expected ${test.expectedResults?.[0].count} and received ${result[0].count}`;
        })
    },
    {
        name: 'Duplicate emails',
        query: `
        SELECT * FROM (
            SELECT COUNT(user_email) as duplicate_count
            FROM users
            GROUP BY TRIM(LOWER(user_email))
        ) subquery
        WHERE subquery.duplicate_count > 1
        `,
        expectedResults: [],
        message: ((test: QueryTest, result: Array<any>): string => {
            const totalDups = result.reduce((accumulator, obj) => accumulator + parseInt(obj.duplicate_count), 0);
            return `There are ${result.length} emails duplicated with a total of ${totalDups - result.length} duplicates`;
        })
    },
    {
        name: 'IMPORTANT Missing workbooks (number of attempts is greater than workbooks)',
        query: `
        SELECT COUNT(*) FROM (
            SELECT g.created_at, COUNT(b.student_grade_id) as workbook_count, g.student_grade_num_attempts, g.student_grade_id, u.user_id, g.course_topic_question_id
            FROM student_grade g
            LEFT JOIN student_workbook b ON
            g.student_grade_id = b.student_grade_id
            INNER JOIN users u ON
            g.user_id = u.user_id
            GROUP BY g.student_grade_id, u.user_id, u.user_email, g.course_topic_question_id, g.updated_at
        ) subquery
        WHERE subquery.workbook_count < student_grade_num_attempts
        AND created_at > '2020-08-31 03:00:00.000+00'
        `,
        expectedResults: [{
            count: '0'
        }],
        message: ((test: QueryTest, result: Array<any>): string => {
            if(result.length !== 1) {
                return `Expected 1 row but got ${result.length}`;
            }
            return `Expected ${test.expectedResults?.[0].count} and received ${result[0].count}`;
        })
    },
    {
        name: 'Missing attempt counts (number of attempts is less than workbook count)',
        query: `
        SELECT COUNT(*) FROM (
            SELECT g.created_at, COUNT(b.student_grade_id) as workbook_count, g.student_grade_num_attempts, g.student_grade_id, u.user_id, g.course_topic_question_id
            FROM student_grade g
            LEFT JOIN student_workbook b ON
            g.student_grade_id = b.student_grade_id AND b.student_workbook_random_seed = g.student_grade_original_random_seed
            INNER JOIN users u ON
            g.user_id = u.user_id
            GROUP BY g.student_grade_id, u.user_id, u.user_email, g.course_topic_question_id, g.updated_at
        ) subquery
        WHERE subquery.workbook_count > student_grade_num_attempts
        AND created_at > '2021-02-08 03:00:00.000+00'
        `,
        expectedResults: [{
            count: '0'
        }],
        message: ((test: QueryTest, result: Array<any>): string => {
            if(result.length !== 1) {
                return `Expected 1 row but got ${result.length}`;
            }
            return `Expected ${test.expectedResults?.[0].count} and received ${result[0].count}`;
        })
    },
    {
        name: 'How many rows have rendered html',
        query: `
        SELECT COUNT(*)
        FROM student_workbook
        WHERE student_workbook_submitted -> 'renderedHTML' IS NOT NULL;
        `,
        expectedResults: [{
            count: '0'
        }],
        message: ((test: QueryTest, result: Array<any>): string => {
            if(result.length !== 1) {
                return `Expected 1 row but got ${result.length}`;
            }
            return `Expected ${test.expectedResults?.[0].count} and received ${result[0].count}`;
        })
    },
    {
        name: 'How many workbooks have non object data (string, null)',
        query: `
        SELECT count(*)
        FROM student_workbook
        WHERE jsonb_typeof(student_workbook_submitted) != 'object';
        `,
        expectedResults: [{
            count: '0'
        }],
        message: ((test: QueryTest, result: Array<any>): string => {
            if(result.length !== 1) {
                return `Expected 1 row but got ${result.length}`;
            }
            return `Expected ${test.expectedResults?.[0].count} and received ${result[0].count}`;
        })
    },
    {
        name: 'How many rows are missing form_data',
        query: `
        SELECT COUNT(*)
        FROM student_workbook
        WHERE student_workbook_submitted -> 'form_data' IS NULL;
        `,
        expectedResults: [{
            count: '0'
        }],
        message: ((test: QueryTest, result: Array<any>): string => {
            if(result.length !== 1) {
                return `Expected 1 row but got ${result.length}`;
            }
            return `Expected ${test.expectedResults?.[0].count} and received ${result[0].count}`;
        })
    },
    {
        name: 'Problems with incorrect prefix',
        query: `
        SELECT COUNT(*)
        FROM course_topic_question
        WHERE
        course_topic_question_webwork_question_ww_path NOT LIKE 'Library/%' AND
        course_topic_question_webwork_question_ww_path NOT LIKE 'Contrib/%' AND
        course_topic_question_webwork_question_ww_path NOT LIKE 'webwork-open-problem-library/%' AND
        course_topic_question_webwork_question_ww_path NOT LIKE 'private/our/%' AND
        course_topic_question_webwork_question_ww_path NOT LIKE 'private/my/%' AND
        course_topic_question_webwork_question_ww_path NOT LIKE 'private/templates/%' AND
        course_topic_question_webwork_question_ww_path NOT LIKE 'private/rederly/%' AND
        course_topic_question.course_topic_question_active = true AND
        course_topic_question_errors IS NULL;
        `,
        expectedResults: [{
            count: '0'
        }],
        message: ((test: QueryTest, result: Array<any>): string => {
            if(result.length !== 1) {
                return `Expected 1 row but got ${result.length}`;
            }
            return `Expected ${test.expectedResults?.[0].count} and received ${result[0].count}`;
        })
    },
    {
        name: 'Exam problems with incorrect prefix',
        query: `
        SELECT COUNT(*) FROM
        (
            SELECT
            course_question_assessment_info_id,
            UNNEST(course_question_assessment_info_additional_problem_paths) as course_question_assessment_info_additional_problem_paths,
            course_question_assessment_info_errors,
            course_question_assessment_info_active
            FROM course_question_assessment_info
        ) ss
        WHERE
        course_question_assessment_info_additional_problem_paths NOT LIKE 'Library/%' AND
        course_question_assessment_info_additional_problem_paths NOT LIKE 'Contrib/%' AND
        course_question_assessment_info_additional_problem_paths NOT LIKE 'webwork-open-problem-library/%' AND
        course_question_assessment_info_additional_problem_paths NOT LIKE 'private/our/%' AND
        course_question_assessment_info_additional_problem_paths NOT LIKE 'private/templates/%' AND
        course_question_assessment_info_additional_problem_paths NOT LIKE 'private/rederly/%' AND
        course_question_assessment_info_additional_problem_paths NOT LIKE 'private/my/%' AND
        course_question_assessment_info_active = true AND
        course_question_assessment_info_errors IS NOT NULL;
        `,
        expectedResults: [{
            count: '0'
        }],
        message: ((test: QueryTest, result: Array<any>): string => {
            if(result.length !== 1) {
                return `Expected 1 row but got ${result.length}`;
            }
            return `Expected ${test.expectedResults?.[0].count} and received ${result[0].count}`;
        })
    },
    {
        name: 'Missing last influencing attempt (based on num attempts)',
        query: `
        SELECT COUNT(*)
        FROM student_grade
        WHERE last_influencing_attempt_workbook_id IS NULL AND
        student_grade_num_attempts > 0
        AND created_at > '2020-11-15 22:24:07.4-05';
        `,
        expectedResults: [{
            count: '0'
        }],
        message: ((test: QueryTest, result: Array<any>): string => {
            if(result.length !== 1) {
                return `Expected 1 row but got ${result.length}`;
            }
            return `Expected ${test.expectedResults?.[0].count} and received ${result[0].count}`;
        })
    },
    {
        name: 'Missing last influencing attempt (based on last influencing legal attempt)',
        query: `
        SELECT COUNT(*)
        FROM student_grade
        WHERE last_influencing_attempt_workbook_id IS NULL AND
        last_influencing_legal_attempt_workbook_id IS NOT NULL
        `,
        expectedResults: [{
            count: '0'
        }],
        message: ((test: QueryTest, result: Array<any>): string => {
            if(result.length !== 1) {
                return `Expected 1 row but got ${result.length}`;
            }
            return `Expected ${test.expectedResults?.[0].count} and received ${result[0].count}`;
        })
    },
    {
        name: 'Missing last influencing attempt (based on last influencing credited attempt)',
        query: `
        SELECT COUNT(*)
        FROM student_grade
        WHERE last_influencing_attempt_workbook_id IS NULL AND
        last_influencing_credited_attempt_workbook_id IS NOT NULL
        `,
        expectedResults: [{
            count: '0'
        }],
        message: ((test: QueryTest, result: Array<any>): string => {
            if(result.length !== 1) {
                return `Expected 1 row but got ${result.length}`;
            }
            return `Expected ${test.expectedResults?.[0].count} and received ${result[0].count}`;
        })
    },
    {
        name: 'Stuck exports',
        query: `
        SELECT
        COUNT(*)
        FROM course_topic_content
        WHERE course_topic_content_last_exported IS NOT NULL AND course_topic_content_export_url IS NULL;
        `,
        expectedResults: [{
            count: '0'
        }],
        message: ((_test: QueryTest, result: Array<any>): string => {
            if(result.length !== 1) {
                return `ERROR: Expected 1 row but got ${result.length}`;
            }
            return `Received ${result[0].count}`;
        })
    },
    {
        name: 'Duplicate attachments',
        query: `
        SELECT COUNT(problem_attachment_cloud_filename) - COUNT(DISTINCT problem_attachment_cloud_filename) AS count FROM problem_attachment;
        `,
        expectedResults: [{
            count: '96'
        }],
        message: ((_test: QueryTest, result: Array<any>): string => {
            if(result.length !== 1) {
                return `ERROR: Expected 1 row but got ${result.length}`;
            }
            return `Received ${result[0].count}`;
        })
    },
]

export default queryTests;