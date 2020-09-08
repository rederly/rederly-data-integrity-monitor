export interface QueryTest {
    name: string;
    query: string;
    expectedResults: Array<any>;
    message: (test: QueryTest, result: Array<any>) => string;
}

const queryTests: Array<QueryTest> = [
    {
        name: 'Missing Grades Count',
        query: `
        SELECT count(*)
        FROM student_enrollment
        INNER JOIN course ON course.course_id = student_enrollment.course_id
        INNER JOIN course_unit_content ON course_unit_content.course_id = course.course_id
        INNER JOIN course_topic_content ON course_topic_content.course_unit_content_id = course_unit_content.course_unit_content_id
        INNER JOIN course_topic_question ON course_topic_question.course_topic_content_id = course_topic_content.course_topic_content_id
        LEFT JOIN student_grade ON student_grade.course_topic_question_id = course_topic_question.course_topic_question_id AND student_grade.user_id = student_enrollment.user_id
        WHERE student_grade.student_grade_id IS NULL
        ;
        `,
        expectedResults: [{
            count: '0'
        }],
        message: ((test: QueryTest, result: Array<any>): string => {
            if(result.length !== 1) {
                return `Expected 1 row but got ${result.length}`;
            }
            return `Expected ${test.expectedResults[0].count} and received ${result[0].count}`;
        })
    }
]

export default queryTests;