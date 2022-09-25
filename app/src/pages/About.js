import { Link } from 'react-router-dom';
import TempLayout from '../components/layouts/Temp'
import styled from '@emotion/styled';
const About = props => 
  <TempLayout Content={Content}/>;

export default About
const Style = styled.div`
span {
  color: rgb(233, 250, 41);
}
`
const Content = [
  {
    headline: 'About',
    content: <Style> 
      Pollinations wants to diversify creativity and spread it through digital ecosystems. 
      Whether in image, video or audio, we invite people to <span> imagine new worlds with the help of AI. </span>
      <br/> <br/>
      For companies, our developers write code on top of the latest AI models, 
      providing <span> customized outcomes and specific aesthetics.</span> 
      <br/> With the <b> API </b>, AI creation can be integrated directly within websites and social media platforms. 
      <br/> <span> Creating gets easy, fast, and fun. </span>
      <br/> <br/>
      And on-site, Pollinations offers <b> AI-powered experiences </b> like festival installations for the creative industry.
      </Style>,
  },
  {
    headline: 'Next steps',
    content: <Style>
      With the increased investments in VR technology, the popularization of the metaverse is a matter of time. 
      On a research level, our team is developing technology to make it possible for people to <span> generate 3D objects and avatars just with text prompts. </span> 
      This process is still costly and time-consuming, but a crucial part of building the next chapter of the world wide web.
      </Style>,
  },
  {
    headline: 'Who',
    content: <Style>
      Deep tech based in Berlin. 
      Our team of data scientists, machine-learning specialists, artists and futurists is profoundly 
      involved in the AI ecosystem. The AI models are open-source and constantly updated by a thriving community. 
      To talk to us, reach out on <a href='https://discord.gg/XXd99CrkCr' children='Discord' style={{color: 'rgb(233, 250, 41)'}}/>  or at <span > hello@pollinations.ai </span>
    </Style>
  }
];

