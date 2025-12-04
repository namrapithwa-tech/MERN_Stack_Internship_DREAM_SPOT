import './App.css';
import Feature from './feature_component/feature';
import Header from './Header/header';
import HeroSection from './herosection/herosection';
import MyPortfolio from './myportfolio_components/myportfolio';
import Resume from './Resume/Resume';
import Testimonials from './Testimonials/testimonials';
import Clients from './Clients/clients';

function App() {
  return (
    <>
      <Header />
      <HeroSection />
      <Feature />
      <MyPortfolio />
      <Resume/>
      <Testimonials/>
      <Clients/>
      
    </>
  );
}

export default App;
