import styled from 'styled-components';
import React, { useState, ReactElement } from 'react';
import { connect } from 'react-redux';
import { Drawer } from 'antd';
import { UseTranslationResponse, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { AppState } from '../../store';
import { IUserState } from '../../store/user/types';
import { Title, Icon, ExternalLink } from '../common';
import { makeAcronym } from '../../utils/stringUtils';
import { SIZES } from '../../constants/styleConstants';

type AvatarProps = {
  isActive: boolean;
};

const Avatar = styled.div<AvatarProps>`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid ${({ theme, isActive }) => isActive ? theme.palette.lightGreen : theme.palette.whiteTranslucent};
  color: ${({ theme }) => theme.palette.lightGrey};
  background-color: ${({ theme }) => theme.palette.secondaryTranslucent};
  &:hover {
    border: 1px solid ${({ theme }) => theme.palette.white};
  }
`;

const DrawerHeader = styled.div`
  padding: 20px 20px;
  background-color: #e9e9e9;
  display: flex;
  flex-direction: column;
  & > h1 {
    margin-bottom: 0;
  }
`;

const LinksContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const LinkContent = styled.div`
  border-bottom: 1px solid #e9e9e9;
  padding: 20px 20px;
  &:hover {
    background-color: #e9e9e9;
  }
  & > h1 > a {
    color: ${({ theme }) => theme.palette.texts.black};
  }
`;

const Signout = styled.div`
  display: flex;
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  border-top: 1px solid #e9e9e9;
  padding: 20px 25px;
`;

const SignoutIcon = styled(Icon)`
  padding-right: 10px;
`;

type Props = {
  user?: IUserState;
};

type LinkObject = { name: string, to: string };

const renderLinks = (links: LinkObject[]): ReactElement[] => (
  links.map(link => (
    <Link
      id={`account-settings.link.${link.to.substring(1)}`}
      to={link.to}
      key={link.to}
    >
      <LinkContent>
        <Title size="small">
          {link.name}
        </Title>
      </LinkContent>
    </Link>
  ))
);

const AccountSettings = ({ user }: Props) => {
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [t]: UseTranslationResponse = useTranslation();
  const links = [
    { name: t('account-settings.links.organization'), to: '/profile/organization' },
    { name: t('account-settings.links.usage'), to: '/profile/usage' },
    { name: t('account-settings.links.keys'), to: '/profile/keys' }
  ];

  const onClose = (): void => {
    setSidebarVisible(false);
  };

  const openSidebar = (): void => {
    setSidebarVisible(true);
  };

  const userName = user && user.profile && user.profile.fullName;
  const acronym = userName && makeAcronym(userName);

  return (
    <div>
      <Avatar id="sidebar-avatar" onClick={openSidebar} isActive={isSidebarVisible}>{acronym}</Avatar>
      <Drawer
        width={SIZES.SIDEBAR_WIDTH}
        placement="right"
        // put Drawer below navbar but keep mask position, prevent navbar for getting higher than screen
        maskStyle={{
          backgroundColor: 'transparent',
          top: `-${SIZES.NAVBAR_HEIGHT}`,
          height: `calc(100% + ${SIZES.NAVBAR_HEIGHT})`
        }}
        style={{
          top: SIZES.NAVBAR_HEIGHT,
          maxHeight: `calc(100% - ${SIZES.NAVBAR_HEIGHT})`
        }}
        bodyStyle={{
          padding: 0
        }}
        closable={false}
        onClose={onClose}
        visible={isSidebarVisible}
      >
        <DrawerHeader>
          <Title size="large" id="sidebar-username">{userName}</Title>
          <span id="sidebar-org">{t('account-settings.label.organization')}</span>
        </DrawerHeader>
        <LinksContainer>
          {renderLinks(links)}
        </LinksContainer>
        <a href="/logout" rel="noopener noreferrer" id="sidebar-signout">
          <Signout>
            <SignoutIcon type="signOut" />
            <Title size="small" id="sidebar-signout-title">{t('account-settings.links.sign-out')}</Title>
          </Signout>
        </a>
      </Drawer>
    </div >
  );
};

const mapStateToProps = (state: AppState) => ({
  user: state.user
});

export default connect(mapStateToProps, null)(AccountSettings);