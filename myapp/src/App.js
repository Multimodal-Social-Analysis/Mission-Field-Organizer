import './App.css';
import { useDropzone } from 'react-dropzone'; //npm install --save react-dropzone (on terminal; if necessary)
import { useCallback, useState, useEffect } from 'react';
import { saveAs } from 'file-saver';
import { Popup } from "reactjs-popup";
import ReactApexChart from 'react-apexcharts'
import "./reactflow.css"
var JSZip = require("jszip");

/*
Ideas: Logo
-Loading Screen????
-Help Page (SUPER MAYBE: potential cute graphic/animation to explain the backend)
-------------------------Upload Button
-------------------------Download Button
-Factors (add a checklist so that we can remove them)
-MindMap Button
*/
const zip = new JSZip();
const factors = [
// "Commerce", 
// "Culture", 
// "Drugs",
// "Education",  
// "Gastronomy", 
// "Infrastructure", 
// "Nature", 
// "Poverty", 
// "Pollution", 
// "Religion", 
// "Security", 
// "Sexuality", 
// "Socialization",
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

/*"Vandalism"*/];
const recordedFactors = []
const actualFactors = []
const dict = {}
var check = 0;
//const count = []

const API_KEY = "" //Key Goes Here

// const dosomething = () => {
//   console.log(recordedFactors)
//   console.log(dict)
//   console.log(count)

//   //console.log(recordedFactors.length)
//   for (let i = 0; i<recordedFactors.length; i++){
//     count.push(dict[recordedFactors[i]])
//   }
//   // console.log(count)
//   // PieChart()
//   // return(
//   //   <PieChart></PieChart>
//   // )
// }

// const PieChart = () => {
//   //const theme = useTheme();

//   // const updateChart = (count) => {
//   //   chartData.series = count
//   // }
//   // const [test, setTest] = useState([])

//   // const updateTest = () =>{
//   //   setTest(count)
//   // }

//   const chartData = {
//     chart: {
//       type: "donut",
//       id: "apexchart-example",
//       // events: {
//       //   dataPointSelection: function(event, charContext, config) {
//       //     let selectedLabel=config.w.config.labels[config.dataPointIndex]
//       //     // console.log(selectedLabel)
          
//       //   }
//       // }
//     },

//     // series: [1,2,3,4,5,6,7,8,9,1,1,2,3,4,5,6,7],
//     // labels: factors,
//     series: count,
//     labels: recordedFactors,
//     legend: {
//       labels:{colors: "white", fontsize:"2vh"}, 
//     },
//     colors: ["#ff0000", "#0000ff", "#006400", "#ffff00", "#808080", "#ffffcc", "#ce7e00", "#abcdef", "#e6ccff", "#800000", "#ffd700", "#38761d"],
//     // series: count,
//     // labels: recordedFactors,
//   };

//   return <ReactApexChart options={chartData} series={chartData.series} type="donut" width="490"/>;
// };


const handleSendRequest = async (raw, filename) => {
  // const prompt = 
  // //"Substance abvuse is bad"
  // "The ethical aspect goes beyond due and rights, to self-giving love. Why is this good? With mere juridical functioning, each misdeed evokes an equal punishment as retribution, giving a zero sum, whereas the ethical aspect can bring extra good into the world that was not there before, and can temper justice with mercy. The ethical aspect makes attitude (self-giving generosity, openness and sacrifice v. self-serving meanness, competitiveness, self-protection) important -- both within individuals and pervading society. It is the ethical aspect that enables trust in society. The pistic / faith aspect offers the possibility of commitment to something higher, something ultimate -- motivation, courage and perseverance. The ethical aspect seems to have a paradox, in which, by tending to give way to the other, it does not enforce its norm, and hence cannot motivate. The pistic aspect motivates, and in harmony 228 with the ethical aspect will motivate to self-giving and the bringing of extra good. In harmony with all aspects, the result is what the Hebrew language calls shalom and the Arabic, salaam. In one word,"
  // +
  var prompt = raw
  prompt +=
    
  //"\nChoose one of the following factors that best applies to this text (only respond with the answer):"
  "\nEscolha um dos seguintes fatores que melhor se aplica a este texto (responda apenas com a resposta):"
  + "\n["+factors+"]"
  +"\n“Don’t justify your answers. Don’t give information not mentioned in the CONTEXT INFORMATION.Do not use punctuation.”"
  //+"\n Use this format: \n [Factor], [Percentage]"
  //"Choose one of the following factors that best represents the social issue in this text (only respond with the answer): [Social Assistance, City, Commerce, Culture, Drugs, Students, Gastronomy, Infrastructure, Nature, Heritage, Poverty, Pollution, Religion, Security, Sexuality, Socialization, Vandalism]"  
  //console.log(prompt)
  var result = ""
  
  try {
    while(result === ""){
      const response = await processMessageToChatGPT([{ message: prompt, sender: "user" }]);
      const content = response.choices && response.choices.length 
      > 0 ? response.choices[0]?.message?.content : null;
      if (content) {
        result = content
        if (!factors.includes(result)){
          result = ""
        }
      }
    }
  } catch (error) {
    console.error("Error processing message:", error);
  } finally {
    console.log(prompt)
    console.log(result)

    var passedTest = true;
    //var count = 0;
    for (let i = 0; i<recordedFactors.length;i++){
      if (recordedFactors[i] === result){
        passedTest = false
        dict[result] += 1
      }
    }
    if (passedTest === true){
      recordedFactors.push(result)
      dict[result] = 1
    }
    actualFactors.push(result)
    zip.folder(result).file(filename, raw)

    //Record Result
    
  }
};

async function processMessageToChatGPT(chatMessage) {
  const apiMessage = chatMessage.map((messageObject) => {
    const role = "user"//messageObject.sender === "ChatGPT" ? "assistant" : "user";
    return { role, content: messageObject.message };
  });

  const apiRequestBody = {
    "model": "gpt-3.5-turbo",
    "messages": [
      { role: "system", content: "Don’t justify your answers. Don’t give information not mentioned in the CONTEXT INFORMATION. Do NOT use punctuation." },
      ...apiMessage,
    ],
  //   { role: "system", content: "You are an AI desgined to find the main topic of a text based ONLY on a given list of factors." 
  //   +"Don’t justify your answers. You will ONLY respond with one of the following answers:" 
  //   +factors
  // },
    //"max_tokens": 4
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

function DownloadZip(){ 
  // Returning number of files (including folders) in zip
  var count = 0
  zip.forEach(function(){
    count++
  })

  if (count === 0){
    console.log("No items in zip file!")
    //Change to alert maybe
  }
  else {
    // console.log(count)
    zip.generateAsync({type:"blob"}).then(function(content) {
      saveAs(content, "example.zip")
    })
  }
}

const DefineFactors = () => {
  var addString = ''
      for (var i = 0; i < factors.length; i++) {
        addString += factors[i] + ", " 
      }

  const [text, setText] = useState('')
  const [showFactors, setShowFactors] = useState(addString)
  
  //console.log(showFactors)

  const change = (event) => {
    setText(event.target.value)
    // console.log(text)
    //setShowFactors(factors)
  }

  const click = () => {
    //console.log(text)
    if (text === "") {
      alert("Por favor, envie um Fator")
    }
    else{
      factors.push(text)
      // setShowFactors([...factors])
      var addString = ''
      for (var i = 0; i < factors.length; i++) {
        addString += factors[i] + ", " 
      }
      setShowFactors([...addString])
      setText('')
      // console.log(factors)
      // change(event)
      // console.log(factors)
    }
  }
  
  return(
    <div>
      <p className='popup-text'>Fatores Sociais Atuais:</p>
      {/* {check ? <p>{showFactors}</p> : null} */}
      <p className={"popup-text-factor"} onChange={change}>[{showFactors}]</p>
      <div>
        <input className='popup-textbox' onChange={change} placeholder={"Insira o Fator..."} value={text}></input>
        <button className='Submit-Button' onClick={click}>Enviar</button>
      </div>
    </div>
  )
}

var loading = 0;
const Dropzone = () => {
  const onDrop = useCallback(acceptedFiles => {    
    // var index = 0
    acceptedFiles.forEach((file) => {
      const reader = new FileReader()

      reader.onabort = () => console.log('file reading was aborted')
      reader.onerror = () => console.log('file reading has failed')
      reader.onload = () => {
      // File contents edited here
        const str = reader.result

        handleSendRequest(str, file.name)

        //AI STUFF GOES HERE

        // zip.folder(actualFactors[index]).file(file.name,str)
        // index++;
        // zip.folder("NAMEHERE")
        // zip.file(file.name, str)
      }
      reader.readAsText(file)
    })
    loading = 1;

  }, [])

  //console.log(recordedFactors.length)
  // for (let key in dict){
  //   count.push(dict[key].length)
  // }
  // console.log(count)

  // Potentially add to limit upload types
    //, accept:{'application'}
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
  const [chartData, setChartData] = useState({
    series: [],
    labels: [],
    legend: {show:false},
    // legend: { labels: { colors: 'black', 
    //   fontsize: '10vh',
    //   fontweight: "bold", 
    //   // floating: true,
    // } },
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
          return `${chartData.labels[seriesIndex]}`/*${'\r\n'}${val.toFixed(2)}%`*/;
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
        // return seriesName + ' - <strong>' + opts.w.globals.series[opts.seriesIndex][opts.dataPointIndex] + '</strong>'
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

  const dosomething = () => {
    console.log(recordedFactors)
    console.log(dict)
    check = 1;
    // console.log(count)

    // const newCount = count;
    // const newRecordedFactors = recordedFactors;
  
    var newCount = []
    //console.log(recordedFactors.length)
    for (let i = 0; i<recordedFactors.length; i++){
      // count.push(dict[recordedFactors[i]])
      newCount.push(dict[recordedFactors[i]])
    }
    // console.log(count)
    // PieChart()
    // return(
    //   <PieChart></PieChart>
    // )
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
            return `${recordedFactors[seriesIndex]}`/*${'\r\n'}${val.toFixed(2)}%`*/;
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
        tooltipHoverFormatter: function(seriesName, opts) {
          // return seriesName + ' - <strong>' + opts.w.globals.series[opts.seriesIndex][opts.dataPointIndex] + '</strong>'
          return seriesName + 'TEST'
        }
        // tooltip: {
        //   enabled: true,
        //   custom: ({ series, seriesIndex, dataPointIndex, w }) => {
        //       // Customize the tooltip content
        //       const category = w.globals.labels[seriesIndex];
        //       const value = series[seriesIndex];
        //       const percentage = w.globals.seriesPercent[seriesIndex].toFixed(2);
        //       return `<div style="padding: 10px; border-radius: 4px; background-color: #f2f2f2;">
        //           <strong>${category}</strong><br />
        //           Value: ${value}<br />
        //           Percentage: ${percentage}%
        //       </div>`;
        //   },
        // },
      },
    });
  }

  // const HelpPage = () => {
  //   return (
  //     <Popup className='popup-text-help'
  //     trigger={<button className="Help"></button>}
  //     style={{margin: 10}}>
  //       TESTING
  //       TESTING
  //       TESTING
  //       TESTING
  //     </Popup>
  //   )
  // }

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
        {/* {result} */}
          <div dangerouslySetInnerHTML={{ __html: result }} />
        </p>
        <div>
        </div>
      </div>
    )
  }

  const PieChart = () => {
    // if (!chartData || !chartData.type) {
    //   return null; // Return null if chartData or chartData.type is undefined
    // }
    if (check == 1) {
      return(
        <div>
          <Popup
          trigger={<button className="Percent-Button">Distribuição Percentual</button>}>
            <PercentButton></PercentButton>
          </Popup>
          {/* <button className="Percent-Button" onClick={percentButton}>Distribuição Percentual</button> */}
          <ReactApexChart options={chartData} series={chartData.series} type="donut" width="490"  />
        </div>
      )
    }
  }

  return (
    <div className="App">
      {/* <div className="wave"></div> */}
      <header className="App-header">
        {/* <HelpPage></HelpPage> */}
        <PieChart></PieChart>
        <Dropzone></Dropzone>
        <Popup
          trigger={<button className="Test-Button"> Definir Fatores </button>}
          position={['center', 'top center']}>
            <DefineFactors></DefineFactors>
        </Popup>
        {/* <button onClick={testing}></button> */}
        <button className={"Test-Button"} onClick={dosomething}>Mostrar Gráfico</button>
      </header>
    </div>
  );
}

export default App;
