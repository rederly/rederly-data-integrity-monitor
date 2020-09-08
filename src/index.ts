require('dotenv').config();
import configurations from './configurations';
import { WebClient, WebAPICallResult } from '@slack/web-api';
import { Client } from 'pg';

const query = `
SELECT count(*)
FROM student_enrollment
INNER JOIN course ON course.course_id = student_enrollment.course_id
INNER JOIN course_unit_content ON course_unit_content.course_id = course.course_id
INNER JOIN course_topic_content ON course_topic_content.course_unit_content_id = course_unit_content.course_unit_content_id
INNER JOIN course_topic_question ON course_topic_question.course_topic_content_id = course_topic_content.course_topic_content_id
LEFT JOIN student_grade ON student_grade.course_topic_question_id = course_topic_question.course_topic_question_id AND student_grade.user_id = student_enrollment.user_id
WHERE student_grade.student_grade_id IS NULL
;
`;

(async () => {
    const client = new Client();
    
    await client.connect();
    const queryResult = await client.query(query);
    for(let row of queryResult.rows) {
        console.log(row);
    }
    // const web = new WebClient(configurations.slack.accessToken);
    // const result: WebAPICallResult = await web.chat.postMessage({
    //     text: 'Hello World',
    //     channel: 'data-integrity-monitor'
    // });
    // console.log(JSON.stringify(result));
})();
