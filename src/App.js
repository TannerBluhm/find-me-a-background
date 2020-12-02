import {useEffect, useState} from 'react';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';
import './App.css';

const randomWords = require('random-words');
const contextualwebsearchKey = require("./config")["RapidAPI-ContextualWebSearch"];
const unirest = require("unirest");
const headers = {
  "x-rapidapi-host" : "contextualwebsearch-websearch-v1.p.rapidapi.com",
  "x-rapidapi-key" : contextualwebsearchKey
}

function App() {
  const [submitted, setSubmitted] = useState(false);
  const [items, setItems] = useState("");
  const [query, setQuery] = useState("");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [resolution, setResolution] = useState({height: 1080, width: 1920});
  const [page, setPage] = useState("");

  const aspectOptions = ["16:9", "3:2", "21:9", "32:9", "1:1", "4:3"]
  const resOptions = { //TODO: Finish filling in these options
    "16:9": ["1920x1080"],
    "3:2" : [],
    "21:9": [],
    "32:9": [],
    "1:1" : [],
    "4:3" : []
  }

  useEffect(() => {
    // Supressing compiler
    setAspectRatio("16:9");
    setResolution({height: 1080, width: 1920});
  }, [])
  // const Http = new XMLHttpRequest();
  // const url = "https://www.googleapis.com/customsearch/v1?key=AIzaSyCekKeE-iFiABaDXJ5XFKGPRYKa-Vdksu8&cx=9d42989a5ae10e287&q=cat&safe=active";
  // Http.open("GET", url);
  // Http.send();

  // Http.onreadystatechange=function(){
  //   console.log(this.status);
  //   if (this.readyState === 4 && this.status === 200) {
  //     console.log("I think the request was successful?");
  //     // console.log(Http.responseText);
  //     let resp = JSON.parse(Http.responseText);
  //     items(resp.items)
  //   }
  // }

  const handleChange = (e) => {setQuery(e.target.value);}

  const makeReq = (pageNumber, q) => {
    let req = unirest(
      "GET", 
      "https://contextualwebsearch-websearch-v1.p.rapidapi.com/api/Search/ImageSearchAPI"
    )
    req.headers(headers);

    req.query({
      "pageNumber": pageNumber,
      "pageSize": "50", // MAX value
      "q" : q,
      "autoCorrect" : "false",
      "safeSearch" : "true"
    })

    return req;
  }

  const submitQuery = () => {
    // console.log("page: " + page);
    if (!submitted) setSubmitted(true);

    console.log("query: " + query);
    let q;
    if(!query) {
      q = randomWords();
    } else {
      q = query;
    }
    console.log("q: " + q);
    let req = makeReq(1, q);
    
    setItems("");
    req.end(function(res) {
      if (res.error) throw new Error(res.error);
      console.log(res.body.value[0]);
      let choice = processQuery(res.body.value);
      if (choice) {
        console.log(choice);
        let newPic = choice.url;
        setItems(newPic);
      } else {
        checkNextPage(2, q);
      }
    });
  }

  const checkNextPage = (pageNumber, q) => {
    console.log(pageNumber);
    if (pageNumber < 11) {
      let req = makeReq(pageNumber, q);
      req.end(function(res) {

        if (res.body.value.length === 0) {
          checkNextPage(11, q);
          return
        }

        let choice = processQuery(res.body.value);
        if (choice) {
          console.log(choice);
          let newPic = choice.url;
          setItems(newPic);
        } else {
          checkNextPage(pageNumber + 1, q);
        }
      });
    } else {
      setSubmitted(false);
      alert("Couldn't find a photo with the proper resolution :(");
    }
    // console.log("page: " + page);
  }

  const processQuery = (res) => {
    let aspect = resolution.height / resolution.width;
    if (!res) return;
    console.log(res.length);
    let validChoices = [];
    for (let i=0; i<res.length; i++) {
      if (
        res[i].height >= resolution.height &&
        (res[i].height/res[i].width === aspect)
      ) validChoices.push(res[i]);
    }

    let choice = null;
    if (validChoices.length > 0) {
      console.log("choice: ");
      choice = validChoices[
        Math.floor(Math.random() * Math.floor(validChoices.length - 1))
      ];
    } else {
      console.log("No valid options found");
    }

    return choice;
    // console.log(items);
  }

  return (
    <div className="App">
      <header className="App-header">
        <p>
          Need help finding a new desktop background?
          Use the search below and we'll pick one for you.
        </p>
        <div className="resSelectionContainer">
        <input id="searchBar" onChange={handleChange} placeholder="Leave empty for a random selection..."></input>
          <p>Aspect Ratio: </p>
          <Dropdown controlClassName="dropdown" options={aspectOptions} value={aspectOptions[0]} placeholder={aspectOptions[0]} />
          <p>Resolution: </p>
          <Dropdown controlClassName="dropdown" options={resOptions[aspectRatio]} value={resOptions[0]} placeholder={resOptions[0]} />
        </div>
        <a href="#" onClick={submitQuery}>
          <p>
            <span className="bg"/>
            <span className="base"/>
            <span className="btext">Search</span>
          </p>
        </a>
        {(items && submitted) && <img className="searchResult" src={items} alt="this should be a cat"/>}
        {(!items && submitted) && <p>Searching...</p>}
        
      </header>
    </div>
  );
}

export default App;
