import Navigation  from './components/navigation/Navigation';
import Logo from './components/Logo/Logo';
import Rank from './components/Rank/Rank';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import './App.css';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import { Component } from 'react';
import Particles from 'react-particles-js';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';

const particleParam ={
  particles: {
    number: {
      value: 30,
      density: {
        enable: true,
        value_area: 800
      }
    }
  }
}

const initialState = {
  input: '',
      imageUrl: '',
      box: {},
      route: 'signin',
      isSignedIn: false,
      user: {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: ''
      }

}

class App extends Component {
  constructor() {
    super();
    this.state = initialState
  }

loadUser = (data) => {
  this.setState({user: {
    id: data.id,
    name: data.name,
    email: data.email,
    entries: data.entries,
    joined: data.joined
  }})
}


  calculateFaceLocation = (data) => {
    console.log(typeof data)
    console.log(data)
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }

  displayFaceBox = (box) => {
    console.log(box)
    this.setState({box: box})
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

  onButtonSubmit = () => {
    this.setState({imageUrl: this.state.input});
    const USER_ID = 'il8pyrchbcct';
    // Your PAT (Personal Access Token) can be found in the portal under Authentification
    const PAT = 'b3380360ccd540cf80f18265ee5fe288';
    const APP_ID = 'facial-detection-2';
    // Change these to whatever model and image URL you want to use
    const MODEL_ID = 'face-detection';
    const MODEL_VERSION_ID = '6dc7e46bc9124c5c8824be4822abe105';    
    const IMAGE_URL = this.state.input;

    ///////////////////////////////////////////////////////////////////////////////////
    // YOU DO NOT NEED TO CHANGE ANYTHING BELOW THIS LINE TO RUN THIS EXAMPLE
    ///////////////////////////////////////////////////////////////////////////////////

    const raw = JSON.stringify({
        "user_app_id": {
            "user_id": USER_ID,
            "app_id": APP_ID
        },
        "inputs": [
            {
                "data": {
                    "image": {
                        "url": IMAGE_URL
                    }
                }
            }
        ]
    });

    const requestOptions = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Key ' + PAT
        },
        body: raw
    };

    
    // NOTE: MODEL_VERSION_ID is optional, you can also call prediction with the MODEL_ID only
    // https://api.clarifai.com/v2/models/{YOUR_MODEL_ID}/outputs
    // this will default to the latest version_id
    
    fetch("https://api.clarifai.com/v2/models/" + MODEL_ID + "/versions/" + MODEL_VERSION_ID + "/outputs", requestOptions)
      .then(response => response.text())
      .then(response => JSON.parse(response))
      .then(result => {
        if (result) {
          fetch('https://protected-earth-04690.herokuapp.com/image', {//put heroku url here
            method: 'put',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              id: this.state.user.id
            })
          })
          .then(response2 => response2.json())
          .then(count => {
            this.setState(Object.assign(this.state.user, {entries: count}))
          })
          .catch(console.log)
        }
        this.displayFaceBox(this.calculateFaceLocation(result)
      )})
      .catch(error => console.log('error', error));
  }

  onRouteChange = (route) => {
    if(route === 'signout') {
      this.setState({initialState});
    }
    else if (route === 'home') {
      this.setState({isSignedIn: true});
    }
    this.setState({route: route});
  }

  render() {
    return (
      <div className="App">
        <Particles className="particles"
              params={{
            		particleParam
            	}}
            />
       <Navigation isSignedInt={this.state.isSignedIn} onRouteChange={this.onRouteChange}/>
       {this.state.route === 'home' ?
       <div>
       <Logo />
       <Rank 
        name={this.state.user.name}
        entries={this.state.user.entries}/>
       <ImageLinkForm 
         onInputChange={this.onInputChange}
         onButtonSubmit={this.onButtonSubmit}/>
       <FaceRecognition box={this.state.box} imageUrl={this.state.imageUrl}/>
       </div>
       : (this.state.route === 'signin') ?
       <Signin onRouteChange={this.onRouteChange} loadUser={this.loadUser}/>
       :
       <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/> 
        }
      </div>
    );
  }
}

export default App;
