/** @format */

import React from 'react';
import { MetaData, FadeAnimation } from '../utils';
import { NoMatchContainer } from '../containers';

const title = 'Page not found';

const NoMatch = () => (
  <FadeAnimation>
    <MetaData title={title}>
      <NoMatchContainer />
    </MetaData>
  </FadeAnimation>
);

export default NoMatch;
