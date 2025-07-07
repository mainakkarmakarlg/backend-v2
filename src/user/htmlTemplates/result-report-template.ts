const resultReportTemplate = ` <!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CFA Result Analysis</title>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Montserrat', sans-serif;
            background-color: #f5f5f5;
            padding: 20px;
        }

        .container {
            max-width: 800px;
            margin: 0 auto;
            background-color: white;
            padding: 30px;
            padding-bottom: 10px;
            border-radius: 10px;

        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e0e0e0;
        }

        .logo-section {
            display: flex;
            align-items: center;
            gap: 15px;
        }

        .logo {
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #4a90e2, #357abd);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 18px;
        }

        .company-name {
            font-size: 16px;
            color: #666;
            font-weight: 500;
        }

        .result-title {
            font-size: 20px;
            color: #999;
            font-weight: normal;
        }

        .candidate-section {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 15px;

        }

        .candidate-profile {
            display: flex;


        }

        .profile-content {
            display: flex;
            flex-direction: column;
            gap: 6px;


        }

        .candidate-avatar {
            width: 100px;
            height: 100px;
            background: linear-gradient(135deg, #4a90e2, #357abd);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 40px;
            font-weight: bold;
        }

        .candidate-info {
            text-align: center;
            display: flex;
            justify-content: space-between;
            width: 100%;
            gap: 10px;
        }

        .candidate-name {
            font-size: 16px;
            font-weight: bold;
            color: #333;
            margin-bottom: 15px;
        }

        .exam-details {
            display: flex;
            gap: 40px;
            flex-wrap: wrap;
            justify-content: space-evenly;

        }

        .exam-details-2 {
            display: flex;
            flex-direction: column;
            justify-content: space-evenly;


        }


        .detail-item {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 5px;
        }

        .detail-header {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .detail-icon {
            width: 16px;
            height: 16px;
            background: #4a90e2;
            border-radius: 2px;
            position: relative;
        }

        .detail-icon::after {
            content: '✓';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-size: 10px;
        }

        .detail-label {
            font-size: 12px;
            color: #666;
            display: flex;
            justify-content: center;
            justify-items: center;
        }

        .detail-value {
            font-size: 14px;
            font-weight: 600;
            color: #333;

        }

        .description {
            margin: 20px 0px;
            color: #666;
            line-height: 1.6;
            font-size: 10px;
            width: 90%;
            background: #F8F9FAFF;
            border-radius: 15px;

            padding: 10px 20px;


        }

        .description-container {

            display: flex;
            justify-content: center;


        }

        .section-title {
            font-size: 20px;
            display: flex;
            justify-items: center;
            justify-content: center;
            color: #e67e22;
            margin: 10px 0 30px;
            font-weight: 600;
        }

        .subjects-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 40px;
            margin-bottom: 30px;
        }

        .subject-card:nth-child(10) {
            grid-column: 2;
            /* Places it in the middle column */
        }

        .subject-card {
            text-align: center;
            padding: 10px;
            background: #fafafa;
            border-radius: 8px;
            border: 1px solid #e0e0e0;
        }

        .percentage-circle {
            width: 80px;
            height: 80px;
            margin: 0 auto 15px;
            position: relative;
        }

        .circle-bg {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: conic-gradient(#4a90e2 var(--percentage), #e0e0e0 var(--percentage));
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
        }

        .circle-bg::before {
            content: '';
            width: 60px;
            height: 60px;
            background: white;
            border-radius: 50%;
            position: absolute;
        }

        .percentage-text {
            position: absolute;
            font-size: 16px;
            font-weight: bold;
            color: #4a90e2;
            z-index: 1;
        }

        .subject-title {
            font-size: 14px;
            font-weight: 600;
            color: #333;
            margin-bottom: 10px;
            line-height: 1.3;
        }

        .subject-comment {
            font-size: 11px;
            color: #666;
            line-height: 1.4;
        }

        .footer {
            text-align: center;
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px solid #e0e0e0;
            color: #999;
            font-size: 12px;


        }

        .footer-content {
            padding: 10px;
            background: #D8E6F6FF;
            /* primary-150 */
            border-radius: 4px;
            /* border-m */


            width: 100%;
            font-family: Montserrat;
            /* Body */
            font-size: 14px;
            line-height: 22px;
            font-weight: 700;
            color: #2C6FBBFF;/
        }

        /* Responsive design */
        @media (max-width: 600px) {
            .container {
                padding: 20px;
            }

            .header {
                flex-direction: column;
                gap: 15px;
                text-align: center;
            }

            .candidate-section {
                flex-direction: column;
                text-align: center;
                justify-content: space-between;
            }

            .exam-details {
                justify-content: center;
                gap: 20px;
            }


            .subjects-grid {
                grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                gap: 15px;
            }
        }
    </style>
</head>

<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="logo-section">
                <img src="https://del1.vultrobjects.com/crmaswinibajaj/CRM/Platform/ABlogowithtext.png" alt="My Image"
                    width="200px">
            </div>
            <div class="result-title">{{exam_title}}</div>
        </div>

        <!-- Candidate Section -->
        <div class="candidate-section">
            <div class="candidate-info">
                <div class="candidate-profile">
                    <div class="profile-content">
                        <div class="candidate-avatar">{{avatar_initial}}</div>
                        <div class="candidate-name">{{candidate_name}}</div>
                    </div>
                </div>
                <div class="exam-details-2"> 
                    <div class="exam-details">
                        <div class="detail-item">
                            <div class="detail-header">
                                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="#2c6fbb"
                                    class="bi bi-clock" viewBox="0 0 16 16">
                                    <path
                                        d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71z" />
                                    <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0" />
                                </svg>
                                <span class="detail-label">Exam Term</span>
                            </div>
                            <span class="detail-value">{{exam_term}}</span>
                        </div>
{{scoreTemplate}}
                        <div class="detail-item">
                            <div class="detail-header">
                                <svg xmlns="http://www.w3.org/2000/svg" width="15px" height="15px" fill="#2c6fbb"
                                    class="bi bi-file-text" viewBox="0 0 16 16">
                                    <path fill = "#2c6fbb"
                                        d="M5 4a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1zm-.5 2.5A.5.5 0 0 1 5 6h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5M5 8a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1zm0 2a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1z" />
                                    <path
                                        d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2zm10-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1" />
                                </svg>
                                <span class="detail-label">Result</span>
                            </div>
                            <span class="detail-value">{{result}}</span>
                        </div>
                        <div class="detail-item">
                            <div class="detail-header">
                                <svg xmlns="http://www.w3.org/2000/svg" width="15px" height="15px" fill="2c6fbb"
                                    class="bi bi-person" viewBox="0 0 16 16">
                                    <path fill ="#2c6fbb"
                                        d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z" />
                                </svg>
                                <span class="detail-label">{{studentId}}</span>
                            </div>
                            <span class="detail-value">{{cfa_institute_id}}</span>
                        </div>
                    </div>
                    <div class="description-container">
                        <div class="description">
                            {{description}}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Subject-wise Report -->
        <div class="section-title">Subject-wise Report</div>
        <div class="subjects-grid">
            {{#each subjects}}
            <div class="subject-card">
                <div class="percentage-circle">
                    <div class="circle-bg" style="--percentage: {{percentage_deg}};">
                        <div class="percentage-text">{{percentage}}%</div>
                    </div>
                </div>
                <div class="subject-title">{{subject_name}}</div>
                <div class="subject-comment">{{subject_comment}}</div>
            </div>
            {{/each}}
        </div>

        <!-- Footer -->
        <div class="footer">
            <div class="footer-content">{{footer_text}}</div>
        </div>
    </div>
</body>

</html>

</html>`;
export const scoreTemplate = `<div class="detail-item">
                            <div class="detail-header">
                                <?xml version="1.0" standalone="no"?>
                                <svg xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg"
                                    width="15px" height="15px" viewBox="0 0 24 24" fill="#2c6fbb">
                                    <path
                                        d="M16 10H8V9h8zm-4.87 11l1.064 1H3.5C2.122 22 1 20.43 1 18.5S2.122 15 3.5 15H5V5.75C5 3.682 6.122 2 7.5 2h13c1.378 0 2.45 1.57 2.45 3.5S21.878 9 20.5 9H19v7.138l-1 .979V5.75A5.994 5.994 0 0 1 18.64 3H7.5C6.792 3 6 4.176 6 5.75V15h10.57l-.71.826A4.141 4.141 0 0 0 15 18.5a5.186 5.186 0 0 0 .047.692l-1.032-.971A5.555 5.555 0 0 1 14.557 16H3.5C2.701 16 2 17.168 2 18.5S2.701 21 3.5 21zM19 8h1.5c.799 0 1.55-1.168 1.55-2.5S21.299 3 20.5 3h-.677A4.62 4.62 0 0 0 19 5.75zM8 13h8v-1H8zm8-7H8v1h8zm6.491 8.819l-6.998 6.851-2.832-2.663-.685.728 3.53 3.321 7.685-7.522z" />
                                    <path fill="none" d="M0 0h24v24H0z" />
                                </svg>
                                <span class="detail-label">Score</span>
                            </div>
                            <span class="detail-value">{{score}}</span>
                        </div>`;
export default resultReportTemplate;
