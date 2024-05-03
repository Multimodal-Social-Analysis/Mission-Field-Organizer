const API_KEY = ""

const handleSendRequest = async () => {
  const prompt = 
  "The ethical aspect goes beyond due and rights, to self-giving love. Why is this good? With mere juridical functioning, each misdeed evokes an equal punishment as retribution, giving a zero sum, whereas the ethical aspect can bring extra good into the world that was not there before, and can temper justice with mercy. The ethical aspect makes attitude (self-giving generosity, openness and sacrifice v. self-serving meanness, competitiveness, self-protection) important -- both within individuals and pervading society. It is the ethical aspect that enables trust in society. The pistic / faith aspect offers the possibility of commitment to something higher, something ultimate -- motivation, courage and perseverance. The ethical aspect seems to have a paradox, in which, by tending to give way to the other, it does not enforce its norm, and hence cannot motivate. The pistic aspect motivates, and in harmony 228 with the ethical aspect will motivate to self-giving and the bringing of extra good. In harmony with all aspects, the result is what the Hebrew language calls shalom and the Arabic, salaam. In one word, which of the following factors best applies to this text? [Religious, Economic, Judicial, Health]"
  console.log(prompt)
  var result = ""
  
  try {
    const response = await processMessageToChatGPT([{ message: prompt, sender: "user" }]);
    const content = response.choices && response.choices.length 
    > 0 ? response.choices[0]?.message?.content : null;
    if (content) {
      result = content
    }
  } catch (error) {
    console.error("Error processing message:", error);
  } finally {
    console.log(result)
  }
};

async function processMessageToChatGPT(chatMessage) {
  const apiMessage = chatMessage.map((messageObject) => {
    const role = messageObject.sender === "ChatGPT" ? "assistant" : "user";
    return { role, content: messageObject.message };
  });

  const apiRequestBody = {
    "model": "gpt-3.5-turbo",
    "messages": [
      { role: "system", content: "I'm a Student using ChatGPT for learning" },
      ...apiMessage,
    ],
    "max_tokens": 16
  };

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(apiRequestBody),
  });

  return response.json();
}
