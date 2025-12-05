import './App.css';
import Feature from './feature_component/feature';
import Header from './Header/header';
import HeroSection from './herosection/herosection';
import MyPortfolio from './myportfolio_components/myportfolio';
import Resume from './Resume/Resume';
import Testimonials from './Testimonials/testimonials';
import Clients from './Clients/clients';
import Price from './Price/price';
import Blogs from './Blogs/blogs';
import Contact from './Contact/contact';
import Footer from './Footer/footer';

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
      <Price/>
      <Blogs/>
      <Contact/>
      <Footer/>

      
    </>
  );
}

export default App;
