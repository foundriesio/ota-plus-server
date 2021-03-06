import React from 'react';
import { Provider } from 'mobx-react';
import { mount } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import UserStore from '../../../../../stores/UserStore';
import theme from '../../../../../theme';
import BuildTeam from '..';
import * as analyticsHelper from '../../../../../helpers/analyticsHelper';
import {
  OTA_HOME_ADD_MEMBERS,
  OTA_HOME_CREATE_ENVIRONMENT,
  OTA_HOME_READ_MORE_ENVIRONMENT
} from '../../../../../constants/analyticsActions';
import { UI_FEATURES } from '../../../../../config';

const USER_UI_FEATURES = [
  {
    id: UI_FEATURES.ADD_MEMBER,
    isAllowed: true
  },
];

const mockedStores = {
  userStore: new UserStore(),
};

function mountComponent(stores = mockedStores) {
  return mount(
    <Provider stores={stores}>
      <MemoryRouter>
        <ThemeProvider theme={theme}>
          <BuildTeam />
        </ThemeProvider>
      </MemoryRouter>
    </Provider>
  );
}

jest.mock('../../../../../i18n');

describe('<BuildTeam />', () => {
  let wrapper;

  const mockGetOrganizationUsers = jest.fn();

  beforeEach(() => {
    mockedStores.userStore.getOrganizationUsers = mockGetOrganizationUsers;
    mockedStores.userStore.uiFeatures = USER_UI_FEATURES;
    wrapper = mountComponent();
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('renders correctly', () => {
    expect(wrapper.find('BuildTeam')).toHaveLength(1);
  });

  it('should contain Add Member button', () => {
    expect(wrapper.exists('#build-team-add-btn')).toEqual(true);
  });

  it('should call sendAction upon clicking "Add Member" button', () => {
    analyticsHelper.sendAction = jest.fn();
    wrapper.find('#build-team-add-btn').first().simulate('click');
    expect(analyticsHelper.sendAction).toBeCalledWith(OTA_HOME_ADD_MEMBERS);
  });

  it('should fetch default environment members upon clicking "Add Member" button', () => {
    wrapper.find('#build-team-add-btn').first().simulate('click');
    expect(mockGetOrganizationUsers).toHaveBeenCalled();
  });

  it('should call sendAction upon clicking "Create Environment" button', () => {
    analyticsHelper.sendAction = jest.fn();
    wrapper.find('#build-team-create-env-btn').first().simulate('click');
    expect(analyticsHelper.sendAction).toBeCalledWith(OTA_HOME_CREATE_ENVIRONMENT);
  });

  it('should call sendAction upon clicking "Read more" link', () => {
    analyticsHelper.sendAction = jest.fn();
    wrapper.find('ExternalLink').first().simulate('click');
    expect(analyticsHelper.sendAction).toBeCalledWith(OTA_HOME_READ_MORE_ENVIRONMENT);
  });
});
