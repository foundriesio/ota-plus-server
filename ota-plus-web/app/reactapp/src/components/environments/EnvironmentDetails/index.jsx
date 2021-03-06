import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useObserver } from 'mobx-react';
import { Checkbox, Tooltip } from 'antd';
import { useStores } from '../../../stores/hooks';
import EnvironmentDetailsHeader from '../EnvironmentDetailsHeader';
import EnvironmentMembersList from '../EnvironmentMembersList';
import AddMemberModal from '../modals/AddMemberModal';
import RenameEnvModal from '../modals/RenameEnvModal';
import { WarningModal, ExternalLink } from '../../../partials';
import { FeaturesListHeader, SplitContainer, Sidepanel, ContentWrapper, FeatureBlock } from './styled';
import { changeUserEnvironment } from '../../../helpers/environmentHelper';
import { sendAction } from '../../../helpers/analyticsHelper';
import {
  OTA_ENVIRONMENT_ADD_MEMBER,
  OTA_ENVIRONMENT_LEAVE_READ_MORE,
  OTA_ENVIRONMENT_RENAME,
  OTA_ENVIRONMENT_SWITCH,
} from '../../../constants/analyticsActions';
import { REMOVAL_MODAL_TYPE, WARNING_MODAL_COLOR } from '../../../constants';
import { LAYERS_ICON_BLANK, UI_FEATURES, isFeatureEnabled } from '../../../config';
import { URL_FEATURE_ACCESS_READ_MORE, URL_ENVIRONMENTS_LEAVE } from '../../../constants/urlConstants';

function useStoreData() {
  const { stores } = useStores();
  return useObserver(() => ({
    currentEnvironment: stores.userStore.currentOrganization,
    environmentMembers: stores.userStore.userOrganizationUsers,
    currentEnvUIFeatures: stores.userStore.currentEnvUIFeatures,
    uiFeatures: stores.userStore.uiFeatures,
    user: stores.userStore.user,
  }));
}

const EnvironmentDetails = () => {
  const { t } = useTranslation();
  const { stores } = useStores();
  const { currentEnvironment, environmentMembers, currentEnvUIFeatures, user } = useStoreData();
  const [addMemberModalOpen, setAddMemberModalOpen] = useState(false);
  const [renameEnvModalOpen, setRenameEnvModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState('');
  const [removalModal, setRemovalModal] = useState({
    type: undefined
  });
  const { name, namespace } = currentEnvironment;

  useEffect(() => () => {
    stores.userStore.userOrganizationUsers = [];
    stores.userStore.currentEnvUIFeatures = {};
    stores.userStore.currentOrganization = {};
    stores.userStore.showEnvDetails = false;
  }, []);

  const toggleAddMemberModal = () => {
    setAddMemberModalOpen(!addMemberModalOpen);
  };

  useEffect(() => {
    if (stores.userStore.environmentsAddMember) {
      stores.userStore.environmentsAddMember = false;
      toggleAddMemberModal();
    }
  }, []);

  useEffect(() => {
    if (environmentMembers.length > 0 && currentEnvironment) {
      setSelectedMember(environmentMembers[0]);
      environmentMembers.forEach((member) => {
        stores.userStore.getUIFeatures(currentEnvironment.namespace, member.email, true);
      });
    }
  }, [currentEnvironment, environmentMembers]);

  const handleAddMember = (email) => {
    stores.userStore.addUserToOrganization(email, namespace);
    toggleAddMemberModal();
    sendAction(OTA_ENVIRONMENT_ADD_MEMBER);
  };

  const toggleRenameEnvModal = () => {
    setRenameEnvModalOpen(!renameEnvModalOpen);
  };

  const handleRenameEnvironment = (newName) => {
    stores.userStore.editOrganizationName(newName, namespace);
    toggleRenameEnvModal();
    sendAction(OTA_ENVIRONMENT_RENAME);
  };

  const openRemovalModal = (email) => {
    if (email) {
      setRemovalModal({ type: REMOVAL_MODAL_TYPE.MEMBER_REMOVAL, selectedUserEmail: email });
    } else {
      setRemovalModal({ type: REMOVAL_MODAL_TYPE.SELF_REMOVAL });
    }
  };

  const closeRemovalModal = () => {
    setRemovalModal({ type: undefined });
  };

  const setUserOrganization = (newNamespace) => {
    changeUserEnvironment(newNamespace);
    sendAction(OTA_ENVIRONMENT_SWITCH);
  };

  const handleMemberSelect = (member) => {
    setSelectedMember(member);
  };

  const handleMemberRemoval = (email) => {
    if (user.email === email) {
      stores.userStore.deleteMemberFromOrganization(email, false);
      setUserOrganization(user.profile.defaultNamespace);
    } else {
      stores.userStore.deleteMemberFromOrganization(email, true);
    }
    closeRemovalModal();
  };

  const populateRemovalModal = () => {
    const { type, selectedUserEmail } = removalModal;
    const lastToLeave = environmentMembers.length === 1;
    switch (type) {
      case REMOVAL_MODAL_TYPE.SELF_REMOVAL:
        return {
          type: WARNING_MODAL_COLOR.DANGER,
          title: t('profile.organization.remove-modal.title.self'),
          desc: t(lastToLeave
            ? 'profile.organization.remove-modal.desc.self.last'
            : 'profile.organization.remove-modal.desc.self'),
          readMore: !lastToLeave ? {
            analyticsAction: OTA_ENVIRONMENT_LEAVE_READ_MORE,
            title: t('profile.organization.remove-modal.desc.self.read-more'),
            url: URL_ENVIRONMENTS_LEAVE,
          } : null,
          cancelButtonProps: {
            title: t('profile.organization.remove-modal.cancel'),
          },
          confirmButtonProps: {
            title: t('profile.organization.remove-modal.confirm.self'),
            onClick: () => handleMemberRemoval(user.email),
          },
          onClose: closeRemovalModal,
        };
      default:
        return {
          type: WARNING_MODAL_COLOR.DANGER,
          title: t('profile.organization.remove-modal.title'),
          desc: t('profile.organization.remove-modal.desc'),
          cancelButtonProps: {
            title: t('profile.organization.remove-modal.cancel'),
          },
          confirmButtonProps: {
            title: t('profile.organization.remove-modal.confirm'),
            onClick: () => handleMemberRemoval(selectedUserEmail),
          },
          onClose: closeRemovalModal,
        };
    }
  };

  const toggleFeature = (event, featureId) => {
    if (event.target.checked) {
      stores.userStore.toggleFeatureOn(currentEnvironment.namespace, selectedMember.email, featureId);
    } else {
      stores.userStore.toggleFeatureOff(currentEnvironment.namespace, selectedMember.email, featureId);
    }
  };

  return (
    <div>
      <EnvironmentDetailsHeader
        envInfo={currentEnvironment}
        onAddMemberBtnClick={toggleAddMemberModal}
        onRenameBtnClick={toggleRenameEnvModal}
      />
      <SplitContainer>
        <Sidepanel>
          {environmentMembers.length > 0 && (
            <EnvironmentMembersList
              currentEnvUIFeatures={currentEnvUIFeatures}
              envInfo={currentEnvironment}
              environmentMembers={environmentMembers}
              onRemoveBtnClick={openRemovalModal}
              onListItemClick={handleMemberSelect}
              selectedUserEmail={selectedMember.email}
              user={user}
            />
          )}
        </Sidepanel>
        <ContentWrapper>
          <h2>{t('profile.organization.features.title')}</h2>
          <div>
            <span>{t('profile.organization.features.desc')}</span>
            {' '}
            <ExternalLink weight="regular" id="feature-access-read-more" url={URL_FEATURE_ACCESS_READ_MORE}>
              {t('profile.organization.features.read-more')}
            </ExternalLink>
          </div>
          <FeaturesListHeader>
            <span>
              {t('profile.organization.features.header.title')}
            </span>
            <img src={LAYERS_ICON_BLANK} />
          </FeaturesListHeader>
          {selectedMember
            && Object.keys(currentEnvUIFeatures).length === environmentMembers.length
            && currentEnvUIFeatures[selectedMember.email]
              .map(feature => (
                <FeatureBlock key={feature.id} id={feature.id}>
                  <span>{feature.name}</span>
                  {(isFeatureEnabled(
                    currentEnvUIFeatures[user.email],
                    UI_FEATURES.MANAGE_FEATURE_ACCESS
                  ) && currentEnvironment.creatorEmail !== selectedMember.email) && (
                    <Tooltip title={t(`profile.organization.features.${feature.isAllowed ? 'accessible' : 'restricted'}`)}>
                      <Checkbox
                        id={`feature-checkbox-${feature.isAllowed}`}
                        onChange={event => toggleFeature(event, feature.id)}
                        checked={feature.isAllowed}
                      />
                    </Tooltip>
                  )}
                </FeatureBlock>
              ))}
        </ContentWrapper>
      </SplitContainer>
      {addMemberModalOpen && (
        <AddMemberModal onClose={toggleAddMemberModal} onConfirm={handleAddMember} />
      )}
      {renameEnvModalOpen && (
        <RenameEnvModal currentName={name} onClose={toggleRenameEnvModal} onConfirm={handleRenameEnvironment} />
      )}
      {removalModal.type && (
        <WarningModal {...populateRemovalModal()} />
      )}
    </div>
  );
};

export default EnvironmentDetails;
