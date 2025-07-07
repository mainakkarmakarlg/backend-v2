const { writeFileSync } = require('fs');

const cardTemplate = `   <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
                                <tr>
                                    <td style="padding: 16px; border-radius: 8px; background-color: {{bg_color}};">
                                        <div
                                            style="display: flex; align-items: start;text-align:left; font-size: 16px; font-weight: bold; color: #636363; margin-bottom: 8px;">
                                            
                                            <span
                                                style="display: flex; align-items: center; vertical-align: middle; margin-right: 8px;">
                                                <img height="20px" width="20px" src="https://del1.vultrobjects.com/crmaswinibajaj/CRM/Platform/email-question.png"/>
                                            </span>
                                            <span> {{card_question}}</span>

                                        </div>





                                        <div
                                            style="display: flex; align-items: start; font-size: 14px; color:#63636399; margin-bottom: 12px; text-align: left;">
                                            <span
                                                style="display: flex; align-items: center; vertical-align: middle; margin-right: 6px;">
                                                <!-- Right Arrow SVG (black) -->
                                                <img height="20px" width="20px" src="https://del1.vultrobjects.com/crmaswinibajaj/CRM/Platform/email-answer.png"/>
                                                </span>
                                                {{card_answer}}
                                        </div>
                                                
                                                
                                                
                                        <div
                                            style="display: flex; align-items: start; font-size: 13px; color: #FFAF5E;">
                                            <span
                                            style="display: inline-block; vertical-align: middle; margin-right: 6px;">
                                            
                                            <img height="20px" width="20px" src="https://del1.vultrobjects.com/crmaswinibajaj/CRM/Platform/email-feedback.png"/>
                                                
                                            </span>
                                            <span style="text-align: left;">
                                                {{card_feedback}}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            </table>
`;

const mailTemplate = `<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">

    <title>Personalized Study Recommendations</title>
</head>

<body style="margin:0; padding:0; background-color:#f6f7fb; font-family: Verdana, Geneva, Tahoma, sans-serif;">
    <table width="100%"  cellpadding="0" cellspacing="0" style="padding: 0; margin: 0;">
        <tr>
            <td align="center">
                <table width="800" cellpadding="0" cellspacing="0" 
                    style="margin: 40px 0; border-radius: 12px; overflow: hidden;">
                    <!-- Header -->
                    <tr>
                        <td align="center" style="padding: 32px 0 16px 0;">
                            <img src="https://del1.vultrobjects.com/crmaswinibajaj/CRM/Platform/ABlogowithtext.png"
                                alt="Aswini Bajaj Classes" width="200px">
                        </td>
                    </tr>
                    <!-- Banner -->
                    <tr>
                        <td align="center" style="padding: 0;">
                            <div
                                style="padding: 24px 16px; border-top-left-radius: 16px; border-top-right-radius: 16px; background-color: #2C6FBB;">
                                <div style="font-size: 22px; font-weight: bold; color: #fff;">Personalized Study
                                    Recommendations</div>
                                <div style="font-size: 14px; color: #e3ecfa; margin-top: 6px;">
                                    Based on your "Introspect | Analyze" form responses
                                </div>
                            </div>
                        </td>

                    </tr>
                    <!-- Content -->
                    <tr>
                        <td style="padding: 32px 24px 16px 24px;text-align: center; background-color: #FFFFFF;">
                            <div style="font-weight: 700; font-size: 16px; color: #3A3A3A; margin-bottom: 8px;">Hi
                                {{student_name}},</div>
                            <div style="font-size: 15px; color: #63636399; margin-bottom: 24px;">We suggest the
                                following
                                based on your responses:</div>

                            {{cards}}



                            

                            <!-- Important Guidelines -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 24px;">
                                <tr>
                                    <td
                                        style="padding: 18px; background-color: #f7faff; border-radius: 8px;border: 1px solid #7BA1CD">
                                        <div
                                            style="display: flex; align-items: center; font-size: 16px; font-weight: bold; color:#2C6FBB; margin-bottom: 8px;">
                                            <!-- Loudspeaker SVG -->
                                            <span
                                                style="display: flex ;align-items: center; vertical-align: middle; margin-right: 8px;">

                                                <img height="20px" width="20px" src="https://del1.vultrobjects.com/crmaswinibajaj/CRM/Platform/email-guidelines.png"/>
                                            </span>
                                            Important Guidelines
                                        </div>
                                        <ul style="font-size: 14px; color: #2C6FBB; padding-left: 20px; margin: 0;text-align: left;">
                                            <li>Make sure to watch the lectures on 'How to Study,' 'How to Practice,' 'How to Attempt,' and follow all the guidelines and steps outlined in them.</li>
                                            <li>The ' How to Improve Accuracy' lecture is very important.</li>
                                            <li>For managing your emotional intelligence (EQ), several lectures are available in the ‘Exam Mentoring’ section of your app, which provide valuable guidance and directions.</li>
                                            <li>The ‘Study Guidance’ and ‘Exam Guidance’ sections in your App have a lot of past experience-based guidance that you must know.</li>
                                        </ul>
                                    </td>
                                </tr>
                            </table>

                       
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 24px;">
                                <tr>
                                    <td align="center"
                                        style="padding: 16px; background-color: #374151; border-radius: 8px;">
                                        <!-- Chat Icon SVG centered at the top -->
                                        <div style="text-align: center; margin-bottom: 12px;">
                                        <img height="20px" width="20px" src="https://del1.vultrobjects.com/crmaswinibajaj/CRM/Platform/email-reach-us.png"/>
                                        </div>
                                        <div
                                            style="font-size: 18px; font-weight: bold; color: #fff; margin-bottom: 8px;">
                                            Need Further Guidance?
                                        </div>
                                        <div style="font-size: 14px; color: #FFFFFFB2;">
                                            If you have any further questions, Whatsapp at <b>9813393893</b> on
                                            Wednesday/Sunday at 7 PM.
                                            Make sure to send the result, this Questionnaire filled, and your queries or
                                            doubts.
                                        </div>
                                    </td>
                                </tr>
                            </table>


                            <!-- Footer -->
                            <div style="font-size: 12px; color: #999; margin: 24px 0 0 0; text-align: center;">
                                This personalised guidance is based on your assessment. Please follow all recommendations for the best possible results. If you modify your response, you will need to refill this form.<br><br>

                            </div>

                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
    <div style="font-size: 12px; color: #999; margin: 0 0 0 0; text-align: center;">
        50 Chowringhee Road, Rear Building 2nd Floor Kolkata, West Bengal - 700071

    </div>


    <!-- Social Icons (use your own hosted icons for best results) -->
    <div style="display:flex; align-items: center;justify-content: center ; text-align: center;margin-top:8px ;">
        <a href="#" style="margin: 0 8px;"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#94A3B8"
                class="bi bi-youtube" viewBox="0 0 16 16">
                <path
                    d="M8.051 1.999h.089c.822.003 4.987.033 6.11.335a2.01 2.01 0 0 1 1.415 1.42c.101.38.172.883.22 1.402l.01.104.022.26.008.104c.065.914.073 1.77.074 1.957v.075c-.001.194-.01 1.108-.082 2.06l-.008.105-.009.104c-.05.572-.124 1.14-.235 1.558a2.01 2.01 0 0 1-1.415 1.42c-1.16.312-5.569.334-6.18.335h-.142c-.309 0-1.587-.006-2.927-.052l-.17-.006-.087-.004-.171-.007-.171-.007c-1.11-.049-2.167-.128-2.654-.26a2.01 2.01 0 0 1-1.415-1.419c-.111-.417-.185-.986-.235-1.558L.09 9.82l-.008-.104A31 31 0 0 1 0 7.68v-.123c.002-.215.01-.958.064-1.778l.007-.103.003-.052.008-.104.022-.26.01-.104c.048-.519.119-1.023.22-1.402a2.01 2.01 0 0 1 1.415-1.42c.487-.13 1.544-.21 2.654-.26l.17-.007.172-.006.086-.003.171-.007A100 100 0 0 1 7.858 2zM6.4 5.209v4.818l4.157-2.408z" />
            </svg></a>
        <a href="#" style="margin: 0 8px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="#94A3B8" class="bi bi-instagram"
                viewBox="0 0 16 16">
                <path
                    d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233s.008-2.388.046-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92m-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217m0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334" />
            </svg>
        </a>
        <a href="#" style="margin: 0 8px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="#94A3B8" class="bi bi-linkedin"
                viewBox="0 0 16 16">
                <path
                    d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854zm4.943 12.248V6.169H2.542v7.225zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248S2.4 3.226 2.4 3.934c0 .694.521 1.248 1.327 1.248zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016l.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225z" />
            </svg>
        </a>
        <a href="#" style="margin: 0 8px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="#94A3B8" class="bi bi-facebook"
                viewBox="0 0 16 16">
                <path
                    d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951" />
            </svg></a>
    </div>

    <div style="font-size: 11px; color: #999; text-align: center;margin-bottom: 16px;">
        Privacy Policy | Terms & Condition | Refund Policy
    </div>
</body>

</html>`;

export const generteIntrospectHTML = (student_name, cards) => {
  function generateCardHTML(card) {
    return cardTemplate
      .replace('{{card_question}}', card.card_question)
      .replace('{{card_answer}}', card.card_answer)
      .replace('{{card_feedback}}', card.card_feedback)
      .replace('{{bg_color}}', card.bg_color);
  }

  function generateFinalHTML(studentName, cardsData) {
    const cardsHTML = cardsData.map(generateCardHTML).join('\n');
    return mailTemplate
      .replace('{{student_name}}', studentName)
      .replace('{{cards}}', cardsHTML);
  }

  const finalHTML = generateFinalHTML(student_name, cards);
  //   create a html file with the finalHTML
  //   writeFileSync('introspect_email_template.html', finalHTML, 'utf8');

  return finalHTML;
};

// ------------------------------
// 4. Sample Data
// ------------------------------

// ------------------------------
// 5. Generate and Save
// ------------------------------
