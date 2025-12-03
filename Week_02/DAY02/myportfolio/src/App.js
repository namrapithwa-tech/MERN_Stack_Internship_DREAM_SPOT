import './App.css';
import Feature from './feature_component/feature';
import Header from './Header/header';
import HeroSection from './herosection/herosection';
import MyPortfolio from './myportfolio_components/myportfolio';

function App() {
  return (
    <>
      <Header />
      <HeroSection />
      <Feature />
      <MyPortfolio />
    </>
  );
}

export default App;
