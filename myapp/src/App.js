import './App.css';
import { useDropzone } from 'react-dropzone'; //npm install --save react-dropzone (on terminal; if necessary)
import { useCallback, useState, useEffect } from 'react';
import { saveAs } from 'file-saver';
import { Popup } from "reactjs-popup";
import ReactApexChart from 'react-apexcharts';
import "./reactflow.css";
var JSZip = require("jszip");

const zip = new JSZip(); // zip folder that will contain all organized folder files
const factors = [
"Comércio",
"Cultura",
"Drogas",
"Educação",
"Gastronomia",
"Infraestrutura",
"Natureza",
"Pobreza",
"Poluição",
"Religião",
"Segurança",
"Sexualidade",
"Socialização", 
"Vandalism"]; // Default Factors that the client uses (plus the ones added by the user)
const recordedFactors = []; // Factors the AI is actually using (if a factor is not assigned to any text files it will not be in this array)
const dict = {}; // Used to count number of files in a factor (folder)
var check = 0; // Used to determine whether or not the Pie Chart is displayed

const API_KEY = "" //API Key for OpenAI Goes Here

// Handles request to OpenAI
const handleSendRequest = async (raw, filename) => {
  var prompt = raw //contains prompt (added below) and the given text
  prompt +=
  "\nEscolha um dos seguintes fatores que melhor se aplica a este texto (responda apenas com a resposta):"
  + "\n["+factors+"]"
  +"\n“Don’t justify your answers. Don’t give information not mentioned in the CONTEXT INFORMATION.Do not use punctuation.”"

  var result = "" //used to contain the result
  
  try {
    while(result === ""){
      const response = await processMessageToChatGPT([{ message: prompt, sender: "user" }]);
      const content = response.choices && response.choices.length 
      > 0 ? response.choices[0]?.message?.content : null;
      if (content) { //Checks if the result is one of the factors
        result = content
        if (!factors.includes(result)){ // if the result is not one of the given factors it tries again
          result = ""
        }
      }
    }
  } catch (error) {
    console.error("Error processing message:", error);
  } finally {
    console.log(prompt)
    console.log(result)

    // Counts the number of times a factor shows up
    var passedTest = true;
    for (let i = 0; i<recordedFactors.length;i++){
      if (recordedFactors[i] === result){
        passedTest = false
        dict[result] += 1
      }
    }
    if (passedTest === true){
      recordedFactors.push(result) // Adds factor that is actually being used
      dict[result] = 1
    }
    zip.folder(result).file(filename, raw) // Adds file to its folder (based on factor)
  }
};

// Function that handles processing message to ChatGPT
async function processMessageToChatGPT(chatMessage) {
  const apiMessage = chatMessage.map((messageObject) => {
    const role = "user"
    return { role, content: messageObject.message };
  });

  const apiRequestBody = {
    "model": "gpt-3.5-turbo",
    "messages": [
      { role: "system", content: "Don’t justify your answers. Don’t give information not mentioned in the CONTEXT INFORMATION. Do NOT use punctuation." },
      ...apiMessage,
    ],
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

// Used to download zip file
function DownloadZip(){ 
  // Returning number of files (including folders) in zip
  var count = 0
  zip.forEach(function(){
    count++
  })

  if (count === 0){
    console.log("No items in zip file!")
  }
  else {
    zip.generateAsync({type:"blob"}).then(function(content) {
      saveAs(content, "example.zip")
    })
  }
}

// Used to define/update the factors provided by the user
const DefineFactors = () => {
  var addString = ''
      for (var i = 0; i < factors.length; i++) {
        addString += factors[i] + ", " 
      }

  const [text, setText] = useState('')
  const [showFactors, setShowFactors] = useState(addString)

  const change = (event) => {
    setText(event.target.value)
  }

  //adds new Factor
  const click = () => {
    if (text === "") {
      alert("Por favor, envie um Fator")
    }
    else{
      factors.push(text)
      var addString = ''
      for (var i = 0; i < factors.length; i++) {
        addString += factors[i] + ", " 
      }
      setShowFactors([...addString])
      setText('')
    }
  }
  
  return(
    <div>
      <p className='popup-text'>Fatores Sociais Atuais:</p>
      <p className={"popup-text-factor"} onChange={change}>[{showFactors}]</p>
      <div>
        <input className='popup-textbox' onChange={change} placeholder={"Insira o Fator..."} value={text}></input>
        <button className='Submit-Button' onClick={click}>Enviar</button>
      </div>
    </div>
  )
}

var loading = 0; // used to handle progress bar
// Used to handle adding folder with text files
const Dropzone = () => {
  const onDrop = useCallback(acceptedFiles => {    
    acceptedFiles.forEach((file) => {
      const reader = new FileReader()

      reader.onabort = () => console.log('file reading was aborted')
      reader.onerror = () => console.log('file reading has failed')
      reader.onload = () => {
        const str = reader.result
        handleSendRequest(str, file.name) // sends file contents to AI
      }
      reader.readAsText(file)
    })
    loading = 1;
  }, [])

  const {getRootProps, getInputProps} = useDropzone({onDrop})

  return (
    <div>
      <form>
        <div {...getRootProps()}>
          <input {...getInputProps()} />
          {
            <div>
              {loading === 1 ? <ProgressBar duration={2000}></ProgressBar> : null }
              <p className="Upload-Button">Carregar Dados Aqui</p>
            </div>
          }
        </div>
      </form>
      <button className="Test-Button"onClick={DownloadZip}> Baixar Zip </button>
    </div>
  )
}

// Basis for Progress Bar (not fully implemented)
const ProgressBar = ({ duration }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setProgress(prevProgress => {
        if (prevProgress < 100) {
          return prevProgress + 1;
        } else {
          clearInterval(intervalId);
          return prevProgress;
        }
      });
    }, duration / 100);

    return () => clearInterval(intervalId);
  }, [duration]);

  return (
    <div style={{ width: '100%', backgroundColor: '#f0f0f0' }}>
      <div
        style={{
          width: `${progress}%`,
          height: '20px',
          backgroundColor: "tan",
          transition: 'width 0.1s ease-in-out'
        }}
      />
    </div>
  );
};

function App() {
  // Used to configure Pie Chart
  const [chartData, setChartData] = useState({
    series: [],
    labels: [],
    legend: {show:false},
    dataLabels: {
      enabled: true, // Enable data labels
      style: {
          fontSize: '28px',
          fontFamily: 'Arial',
          fontWeight: 'bold',
          colors: ['#000'], // Customize text color
      },
      formatter: (val, { seriesIndex }) => {
          // Return the category name based on the series index
          return `${chartData.labels[seriesIndex]}`;
      },
      // Configure data label placement and line
      dropShadow: {
          enabled: true,
          blur: 1,
          onpacity: 0.8,
      },
      // Add leader lines pointing to the sections
      connector: {
          enabled: true,
          length: 100,
          strokeWidth: 5,
          strokeColor: '#000'
      },
      distributed: true,
      tooltipHoverFormatter: function(seriesName, opts) {
        return seriesName + 'TEST'
      },
    },
    colors: [
      '#fa8072',
      'lightblue',
      'lightgreen',
      '#dfc98c',
      '#808080',
      '#fcc1cc',
      '#855134',
      '#abcdef',
      '#e6ccff',
      '#800000',
      '#ffd700',
      '#38761d',
    ],
  });

  // Used to update Pie Chart
  const dosomething = () => {
    console.log(recordedFactors)
    console.log(dict)
    check = 1;
  
    var newCount = []
    for (let i = 0; i<recordedFactors.length; i++){
      newCount.push(dict[recordedFactors[i]])
    }

    setChartData({
      ...chartData,
      series: newCount,
      labels: recordedFactors,
      dataLabels: {
        enabled: true, // Enable data labels
        style: {
            fontSize: '28px',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            colors: ['#000'], // Customize text color
        },
        formatter: (val, { seriesIndex }) => {
            // Return the category name based on the series index
            return `${recordedFactors[seriesIndex]}`;
        },
        // Configure data label placement and line
        dropShadow: {
            enabled: true,
            blur: 1,
            onpacity: 0.8,
        },
        // Add leader lines pointing to the sections
        connector: {
            enabled: false,
            length: 120,
            strokeWidth: 1,
            strokeColor: '#000',
            dashArray: 3
        },
        distributed: true,
        // The Goal here was to display percentages when hovering over the different categories (did not work)
        tooltipHoverFormatter: function(seriesName, opts) {
          return seriesName + 'TEST'
        }
      },
    });
  }

  // Shows percentages based on Pie Chart
  const PercentButton = () => {
    var totalNum = 0
    for (var i = 0; i < recordedFactors.length; i++) {
      totalNum += 
      dict[recordedFactors[i]]
    }

    var result = ''
    for (var i = 0; i < recordedFactors.length; i++) {
      var percentage = dict[recordedFactors[i]] / totalNum
      result += 
      recordedFactors[i] + ": " + `${(percentage * 100).toFixed(2)}%` + "<br>"     
    }

    return(
      <div>
        <p className='popup-text'>Porcentagens:</p>
        <p className={"popup-text-percent"}>
          <div dangerouslySetInnerHTML={{ __html: result }} />
        </p>
        <div>
        </div>
      </div>
    )
  }

  // Displays Pie Chart
  const PieChart = () => {
    if (check == 1) {
      return(
        <div>
          <Popup
          trigger={<button className="Percent-Button">Distribuição Percentual</button>}>
            <PercentButton></PercentButton>
          </Popup>
          <ReactApexChart options={chartData} series={chartData.series} type="donut" width="490"  />
        </div>
      )
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <PieChart></PieChart>
        <Dropzone></Dropzone>
        <Popup
          trigger={<button className="Test-Button"> Definir Fatores </button>}
          position={['center', 'top center']}>
            <DefineFactors></DefineFactors>
        </Popup>
        <button className={"Test-Button"} onClick={dosomething}>Mostrar Gráfico</button>
      </header>
    </div>
  );
}

export default App;
