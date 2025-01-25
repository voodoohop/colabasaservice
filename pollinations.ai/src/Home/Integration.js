 // Start of Selection
import React, { useContext } from "react"
import { Colors, SectionBG, Fonts } from "../config/global"
import { CodeExamples } from "../components/Integrate/CodeExamples"
import {
  SectionContainer,
  SectionSubContainer,
  SectionHeadlineStyle,
} from "../components/SectionContainer.js"
import { INTEGRATION_TITLE, INTEGRATION_SUBTITLE, HERO_GITHUB_LINK } from "../config/copywrite"
import SectionTitle from "../components/SectionTitle"
import { LLMTextManipulator } from "../components/LLMTextManipulator"
import { ImageContext } from "../utils/ImageContext"
import { GeneralButton } from "../components/GeneralButton"
import { ICONS } from "../assets/icons/icons"
import { ReactSVG } from "react-svg"
import { trackEvent } from "../config/analytics"

export const Integration = () => {
  const { image } = useContext(ImageContext)

  const handleGithubButtonClick = (e) => {
    e.preventDefault()
    trackEvent({
      action: "Github_Button_Click",
      category: "User_Interactions",
      label: "Integration_Page",
      value: 1,
    })
    window.open("https://github.com/pollinations/pollinations/blob/master/APIDOCS.md", "_blank")
  }

  return (
    <SectionContainer backgroundConfig={SectionBG.integration}>
      <SectionSubContainer>
        <SectionTitle title={INTEGRATION_TITLE} />
      </SectionSubContainer>
      <SectionSubContainer>
        <SectionHeadlineStyle>
          <LLMTextManipulator>{INTEGRATION_SUBTITLE}</LLMTextManipulator>
        </SectionHeadlineStyle>
      </SectionSubContainer>
      <SectionSubContainer>
        <GeneralButton
          handleClick={handleGithubButtonClick}
          isLoading={false}
          backgroundColor={Colors.offblack}
          textColor={Colors.offwhite}
          style={{
            fontSize: "1.5rem",
            fontFamily: Fonts.title,
            fontWeight: 600,
          }}
        >
          <ReactSVG
            src={ICONS.github}
            beforeInjection={(svg) => {
              svg.setAttribute("fill", Colors.offwhite)
            }}
            style={{
              width: "32px",
              height: "32px",
              marginRight: "1em",
              background: "transparent",
            }}
          />
          <LLMTextManipulator>{HERO_GITHUB_LINK}</LLMTextManipulator>
        </GeneralButton>
      </SectionSubContainer>
      <SectionSubContainer>
        <CodeExamples image={image} />
      </SectionSubContainer>
    </SectionContainer>
  )
}
