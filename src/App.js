import React, { Component } from 'react';
import './App.css';
import Navigation from './components/Navigation/Navigation';
import SignIn from './components/SignIn/SignIn';
import Register from './components/Register/Register';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Logo from './components/Logo/Logo';
import Rank from './components/Rank/Rank';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Particles from 'react-particles-js';
import Clarifai from 'clarifai';

const app = new Clarifai.App({
 apiKey: "8619f598b3be473b9c7e82741ce5bc91" 
});

const particlesParams = {
  particles: {
    line_linked: {
      shadow: {
        enable: true,
        color: "#3CA9D1",
        blur: 5
      }
    },
    number: {
      value: 80,
      density: {
        enable: true,
        value_area: 800
      }
    }
  }
}

class App extends Component {
  constructor() {
    super();
    this.state = {
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
  }

  loadUser = (data) => {
    this.setState({
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined
      }
    })
  }

  onInputChange = (event) => {
    this.setState({
      input: event.target.value
    })
  }

  calculateFaceLocation = (data) => {
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    
    const clarifaiFace = data.outputs[0].data.regions.map(i => {
      return i.region_info.bounding_box
    })
    
    const box_array = clarifaiFace.map(i => {
      return {
        leftCol: i.left_col * width,
        topRow: i.top_row * height,
        rightCol: width - (i.right_col * width),
        bottomRow: height - (i.bottom_row * height)
      }
    })
    
    return box_array
  }

  displayFaceBox = (box_array) => {
    this.setState({
      box: box_array
    })
  }

  onSubmit = () => {
    this.setState({ imageUrl: this.state.input })

    app.models.predict(
      Clarifai.FACE_DETECT_MODEL,
      this.state.input)
      .then(response => {
        if(response) {
          fetch('http://localhost:3000/image', {
            method: 'put',
            headers: {'Content-type': 'application/json'},
            body: JSON.stringify({
              id: this.state.user.id
            })
          })
          .then(response => response.json())
          .then(count => {
            this.setState(Object.assign(this.state.user, {entries: count}))
          })
        }
        this.displayFaceBox(this.calculateFaceLocation(response))
      })
      .catch(error => console.log('You have an error:', error));
  }  

  onRouteChange = (route) => {
    if(route === 'signout') {
      this.setState({isSignedIn: false})
    }
    else if(route === 'home'){
      this.setState({isSignedIn: true})
    } 
      this.setState({route: route})
  }

  render() {
    const{ isSignedIn, imageUrl, route, box, user } = this.state;
    return (
    <div className="App">
      <Particles params = {particlesParams} className='particles' />
      <Navigation onRouteChange = {this.onRouteChange} isSignedIn={isSignedIn} />
      { route === 'home'
        ? <>
            <Logo />
            <Rank name={user.name} entries={user.entries}/>
            <ImageLinkForm onInputChange={this.onInputChange} onSubmit={this.onSubmit} />
            <FaceRecognition imageUrl={imageUrl} box={box} />
          </>
          : ( route === 'signin'
              ? <SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
              : <Register onRouteChange={this.onRouteChange} loadUser={this.loadUser}/>
            )
      }
    </div>
  );}
}

export default App;
