import React, { useState } from 'react';
import { GeneralButton } from '../GeneralButton';
import { Colors, Fonts } from '../../config/global';
import { IMAGE_FEED_MODE1, IMAGE_FEED_MODE2 } from "../../config/copywrite";
import { CustomTooltip } from '../CustomTooltip';
import { Box } from '@mui/material';
import { TextRephraseTranslate } from '../../components/TextRephraseTranslate';

export function FeedEditSwitch({ toggleValue, handleToggleChange, isLoading }) {
  return (
    <Box style={{ display: 'flex'}}>
      <CustomTooltip title="Activate real-time generated image feed.">
        <GeneralButton
          handleClick={() => handleToggleChange(null, 'feed')}
          isLoading={isLoading}
          borderColor={Colors.lime}
          backgroundColor={toggleValue === 'feed' ? Colors.lime : 'transparent'}
          textColor={toggleValue === 'feed' ? Colors.offblack : Colors.lime}
          style={{ width: '200px', fontSize: '1.8rem', fontFamily: Fonts.body, fontWeight: 600 }}
        >
          <TextRephraseTranslate>{IMAGE_FEED_MODE1}</TextRephraseTranslate>
        </GeneralButton>
      </CustomTooltip>
      <CustomTooltip title="Create an alternative image, this will freeze the feed when enabled.">
        <GeneralButton
          handleClick={() => handleToggleChange(null, 'edit')}
          isLoading={isLoading}
          borderColor={Colors.lime}
          backgroundColor={toggleValue === 'edit' ? Colors.lime : 'transparent'}
          textColor={toggleValue === 'edit' ? Colors.offblack : Colors.lime}
          style={{ width: '200px', fontSize: '1.8rem', fontFamily: Fonts.body, fontWeight: 600 }}
        >
          <TextRephraseTranslate>{IMAGE_FEED_MODE2}</TextRephraseTranslate>
        </GeneralButton>
      </CustomTooltip>
    </Box>
  );
}