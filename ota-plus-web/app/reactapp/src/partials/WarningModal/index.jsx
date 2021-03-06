import React from 'react';
import PropTypes from 'prop-types';
import {
  BackgroundMask,
  ButtonsWrapper,
  CancelButton,
  ConfirmButton,
  Description,
  ModalContainer,
  Title,
  TopBar
} from './styled';
import { WARNING_MODAL_COLOR } from '../../constants';
import { ExternalLink } from '../index';
import { sendAction } from '../../helpers/analyticsHelper';

const WarningModal = ({ type, title, desc, cancelButtonProps, readMore, confirmButtonProps, onClose }) => (
  <>
    <BackgroundMask onClick={onClose} />
    <ModalContainer id="warning-modal">
      <TopBar colorTheme={type} />
      <Title>{title}</Title>
      <Description>
        {desc}
        {readMore && (
          <>
            {' '}
            <ExternalLink
              key="warning-modal-read-more"
              url={readMore.url}
              weight="regular"
              onClick={() => readMore.analyticsAction && sendAction(readMore.analyticsAction)}
            >
              {readMore.title}
            </ExternalLink>
          </>
        )}
      </Description>
      <ButtonsWrapper>
        <CancelButton id="warning-cancel-btn" colorTheme={type} onClick={onClose}>
          {cancelButtonProps.title}
        </CancelButton>
        {confirmButtonProps && (
          <ConfirmButton id="warning-confirm-btn" colorTheme={type} onClick={confirmButtonProps.onClick}>
            {confirmButtonProps.title}
          </ConfirmButton>
        )}
      </ButtonsWrapper>
    </ModalContainer>
  </>
);

WarningModal.propTypes = {
  type: PropTypes.oneOf([WARNING_MODAL_COLOR.DANGER, WARNING_MODAL_COLOR.DEFAULT, WARNING_MODAL_COLOR.INFO]),
  title: PropTypes.string.isRequired,
  desc: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  cancelButtonProps: PropTypes.shape({
    title: PropTypes.string.isRequired,
  }),
  readMore: PropTypes.shape({
    analyticsAction: PropTypes.string,
    title: PropTypes.string,
    url: PropTypes.string,
  }),
  confirmButtonProps: PropTypes.shape({
    title: PropTypes.string.isRequired,
    onClick: PropTypes.func,
  }),
  onClose: PropTypes.func.isRequired
};

export default WarningModal;
