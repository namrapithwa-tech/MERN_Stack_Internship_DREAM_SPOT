import './App.css';
// import Aside from './components/Aside/aside';
import Footer from './components/Footer/footer';
import Header from './components/Header/header';
import Main from './components/Main/main';

function App() {
  return (
    <>
      {/* <div>
        <h1>My Intro App</h1>
        <p>Welcome to my first React application!</p>
      </div>

      <div>
        <img src={avtr} alt="Profile" height={250} width={200} />
      </div>

      <div>
        <h2>About Me</h2>
        <p>Hi! Have a great day, I am Namra Pithwa, curruntly I am a MERN Stack Intern at Dreamspot IT Academy</p>
      </div> */}

      
      <Header />
      {/* <Aside /> */}
      <Main />
      <Footer />
      

    </>
  );
}

export default App;
