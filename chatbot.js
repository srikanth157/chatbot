import React, { useState } from 'react';
import ChatBot from 'react-chatbotify';
import axios from 'axios';

const MyChatBot = () => {
  const [form, setForm] = useState({});
  const [questionCount, setQuestionCount] = useState(0);
  const [flowOptions,setFlowOptions]=useState([])
  const formStyle = {
    marginTop: 10,
    marginLeft: 20,
    border: "1px solid #491d8d",
    padding: 10,
    borderRadius: 5,
    maxWidth: 300
  };

  const handleChatGPTResponse = async (userInput) => {
    try {
      const response = await axios.post('http://localhost:3000/chat', { query: userInput });
      console.log(response.data.answer)
      flowOptions.push([response.data.answer])
        setFlowOptions(flowOptions)
      return response.data.answer;
    } catch (error) {
      console.error('Error getting response from ChatGPT:', error);
      return "Sorry, I couldn't process that. Please try again.";
    }
  };

  const handleSubmitUserInfo = async () => {
    try {
      await axios.post('/api/save-user-info', form);
      // Save to Salesforce (if applicable)
      await axios.post('/api/save-to-salesforce', { form, chatSummary: form.chatSummary });
      console.log("User information and chat history saved successfully.");
    } catch (error) {
      console.error("Error saving user information:", error);
    }
  };

//   const flow = {
//     start: {
//       message: "Hello! You can ask me up to 3 questions. What's your first question?",
//       function: async (params) => {
//         const chatGPTResponse = await handleChatGPTResponse(params.userInput);
//         setForm({...form, chatHistory: [{ question: params.userInput, response: chatGPTResponse }]});
//         setQuestionCount(questionCount + 1);
//       },
//       path: "ask_next_question_or_collect_info"
//     },
//     ask_next_question_or_collect_info: {
//       message: () => questionCount < 3 ? "You can ask another question." : "Let's proceed with collecting your details. What's your name?",
//       function: async (params) => {
//         if (questionCount < 3) {
//           const chatGPTResponse = await handleChatGPTResponse(params.userInput);
//           setForm({
//             ...form,
//             chatHistory: [...form.chatHistory, { question: params.userInput, response: chatGPTResponse }]
//           });
//           setQuestionCount(questionCount + 1);
//         } else {
//           setForm({...form, name: params.userInput});
//         }
//       },
//       path: questionCount < 3 ? "ask_next_question_or_collect_info" : "ask_email"
//     },
//     ask_email: {
//       message: (params) => `Nice to meet you ${params.userInput}, what's your email?`,
//       function: (params) => setForm({...form, email: params.userInput}),
//       path: "ask_mobile"
//     },
//     ask_mobile: {
//       message: "What's your mobile number?",
//       function: async (params) => {
//         setForm({...form, mobile: params.userInput});
//         await handleSubmitUserInfo();
//       },
//       path: "end"
//     },
//     end: {
//       message: "Thank you for your time! Your information has been saved, and we'll be in touch shortly.",
//       component: (
//         <div style={formStyle}>
//           <p>Name: {form.name}</p>
//           <p>Email: {form.email}</p>
//           <p>Mobile: {form.mobile}</p>
//           <p>Chat History:</p>
//           <ul>
//             {form.chatHistory.map((entry, index) => (
//               <li key={index}>
//                 <strong>Q:</strong> {entry.question} <br />
//                 <strong>A:</strong> {entry.response}
//               </li>
//             ))}
//           </ul>
//         </div>
//       ),
//       options: ["New Chat"],
//       chatDisabled: true,
//       path: "start"
//     }
//   };
const flow = {
    start: {
      message: "Hello! You can ask me up to 3 questions. What's your first question?",
      function: async (params) => {
        const chatGPTResponse = await handleChatGPTResponse(params.userInput);
        setForm(prevForm => ({
          ...prevForm,
          chatHistory: [{ question: params.userInput, response: chatGPTResponse }],
        }));
        setQuestionCount(prevCount => prevCount + 1);
      },
      path: "ask_next_question_or_collect_info"
    },
    ask_next_question_or_collect_info: {
      message: () => questionCount < 3 ? "You can ask another question." : "Let's proceed with collecting your details. What's your name?",
      options:flowOptions[0]|| [],
      function: async (params) => {
        if (questionCount < 3) {
          const chatGPTResponse = await handleChatGPTResponse(params.userInput);
          setForm(prevForm => ({
            ...prevForm,
            chatHistory: [...prevForm.chatHistory, { question: params.userInput, response: chatGPTResponse }]
          }));
          setQuestionCount(prevCount => prevCount + 1);
        } else {
          setForm(prevForm => ({ ...prevForm, name: params.userInput }));
        }
      },
      path: questionCount < 3 ? "ask_next_question_or_collect_info" : "ask_email"
    },
    ask_email: {
      message: (params) => `Nice to meet you ${params.userInput}, what's your email?`,
      function: (params) => setForm(prevForm => ({ ...prevForm, email: params.userInput })),
      path: "ask_mobile"
    },
    ask_mobile: {
      message: "What's your mobile number?",
      function: async (params) => {
        setForm(prevForm => ({ ...prevForm, mobile: params.userInput }));
        await handleSubmitUserInfo();
      },
      path: "end"
    },
    end: {
      message: "Thank you for your time! Your information has been saved, and we'll be in touch shortly.",
      component: (
        <div style={formStyle}>
          <p>Name: {form.name}</p>
          <p>Email: {form.email}</p>
          <p>Mobile: {form.mobile}</p>
          <p>Chat History:</p>
          <ul>
            {form.chatHistory && form.chatHistory.length > 0 ? (
              form.chatHistory.map((entry, index) => (
                <li key={index}>
                  <strong>Q:</strong> {entry.question} <br />
                  <strong>A:</strong> {entry.response}
                </li>
              ))
            ) : (
              <p>No chat history available.</p>
            )}
          </ul>
        </div>
      ),
      options: ["New Chat"],
      chatDisabled: true,
      path: "start"
    }
  };

  return (
    <ChatBot
      settings={{
        general: { embedded: true },
        chatHistory: { storageKey: "chat_history_key" }
      }}
      flow={flow}
    />
  );
};

export default MyChatBot;
