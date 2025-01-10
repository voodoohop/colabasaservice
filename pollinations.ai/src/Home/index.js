import { useEffect, useState, useContext } from "react";
import styled from "@emotion/styled";
import Hero from "./Hero";
import Discord from "./Discord";
import { ImageFeed } from "./ImageFeed";
import UserBuilt from "./UserBuilt";
import Supporter from "./Supporter";
import { ImageContext } from "../utils/ImageContext";
import TopBand from "../components/TopBand";
import { TextFeed } from "./TextFeed";
import { ImageURLHeading } from "../components/ImageHeading";
import { Integration } from "./Integration";

export default function Home() {
  const [image, setImage] = useState(null);

  return (
    <ImageContext.Provider value={{ image, setImage }}>
      <Style>
        <Hero />
        {/* <TopBand /> */}
        {/* <ImageURLHeading>Text Feed</ImageURLHeading>
        <TextFeed /> 
        <TopBand /> */}
        <ImageFeed />
        <Integration image={image} />
        {/* <TopBand /> */}
        <UserBuilt />
        {/* 
        <TopBand />
        <Discord />
        <TopBand />
         <CompaniesSection /> */}
        {/* <TopBand /> */}
      </Style>
    </ImageContext.Provider>
  );
}

const Style = styled.div`
  width: 100%;
  padding: 0em;
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  input:focus,
  textarea:focus,
  select:focus {
    outline: none;
  }
`;
