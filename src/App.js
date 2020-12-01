import {useEffect, useState} from 'react';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';
import './App.css';

const unirest = require("unirest");
const headers = {
  "x-rapidapi-host" : "contextualwebsearch-websearch-v1.p.rapidapi.com",
  "x-rapidapi-key" : "28fe4720ccmshb0c89adc5c7246bp1f51c3jsnc4769c5eff4f"
}

function App() {
  const [items, setItems] = useState("");
  const [query, setQuery] = useState("");
  const [aspectRatio, setAspectRation] = useState([16, 9])
  const [resolution, setResolution] = useState({height: 1920, width: 1080});

  const aspectOptions = ["16:9", "3:2", "21:9", "32:9", "1:1", "4:3"]
  const resOptions = { //TODO: Finish filling in these options
    "16:9": ["1920x1080"],
    "3:2" : [],
    "21:9": [],
    "32:9": [],
    "1:1" : [],
    "4:3" : []
  }
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

  const submitQuery = () => {
    console.log(query);

    let req = unirest(
      "GET", 
      "https://contextualwebsearch-websearch-v1.p.rapidapi.com/api/Search/ImageSearchAPI"
    )
    req.headers(headers);

    req.query({
      "pageNumber": "1",
      "pageSize": "100",
      "q" : query,
      "autoCorrect" : "false"
    })
    
    req.end(function(res) {
      if (res.error) throw new Error(res.error);
      console.log(res.body.value[0]);
      let newPic = res.body.value[0].url;
      setItems(newPic);
      return
    })
  }

  const processQuery = (res) => {
    let validChoices = [];
    for (let i=0; i<res.length; i++) {
      if (
        res[i].height === resolution.height &&
        res[i].width === resolution.width
      ) validChoices.push(res[i]);
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <p>
          Need help finding a new desktop background?
          Use the search below and we'll pick one for you.
        </p>
        <input onChange={handleChange}></input>
        <Dropdown options={aspectOptions} value={aspectOptions[0]} placeholder={aspectOptions[0]} />
        <Dropdown options={resOptions[aspectRatio]} value={resOptions[0]} placeholder={resOptions[0]} />
        <button onClick={submitQuery}>
          Gimme that background
        </button>
        {items && <img className="searchResult" src={items} alt="this should be a cat"/>}
      </header>
    </div>
  );
}

export default App;
