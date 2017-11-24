import React, { Component, PropTypes } from 'react';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { Modal, AsyncResponse, Loader } from '../../partials';
import { AsyncStatusCallbackHandler } from '../../utils';
import { Form } from 'formsy-react';
import { FormsyText } from 'formsy-material-ui/lib';
import { FlatButton, SelectField, MenuItem } from 'material-ui';
import serialize from 'form-serialize';
import _ from 'underscore';

@observer
class CreateModal extends Component {
    @observable submitButtonDisabled = true;
    @observable fileName = null;
    @observable selectedHardwareIds = [];
    constructor(props) {
        super(props);
        this.selectHardwareIds = this.selectHardwareIds.bind(this);
    }
    enableButton() {
        this.submitButtonDisabled = false;
    }
    disableButton() {
        this.submitButtonDisabled = true;
    }
    submitForm(type) {
        let formData = new FormData();
        if(this.props.fileDropped)
            formData.append('file', this.props.fileDropped);
        else
            formData.append('file', this.refs.fileUpload.files[0]);
        let data = serialize(document.querySelector('#package-create-form'), { hash: true });
        delete data['fake-file'];
        data.description = data.description ? data.description : "";
        data.vendor = data.vendor ? data.vendor : "";
        if(this.props.uploadToTuf && (type === 'common' || type === 'director')) {
            this.props.packagesStore.createTufPackage(data, formData, this.selectedHardwareIds.join());
        } else {
            this.props.packagesStore.createPackage(data, formData);
        }
        this.hideModal();
    }
    _onFileUploadClick() {
        var fileUploadDom = this.refs.fileUpload;
        fileUploadDom.click();
    }
    _onFileChange(e) {
        let name = e.target.value.split("\\").pop();
        this.fileName = name;
    }
    hideModal(e) {
        if(e) e.preventDefault();
        this.fileName = null;
        this.selectedHardwareIds = [];
        this.props.hide();
    }
    formatHardwareIds(selectedHardwareIds) {
        let hardwareIds = this.props.hardwareStore.hardwareIds;
        return hardwareIds.map((id) => (
            <MenuItem
                key={id}
                insetChildren={true}
                checked={selectedHardwareIds && selectedHardwareIds.indexOf(id) > -1}
                value={id}
                primaryText={id}
                id={"hardware-ids-select-menu-item-" + id}
            />
        ));
    }
    selectHardwareIds(event, index, values) {
        this.selectedHardwareIds = values;
    }
    render() {
        const { shown, hide, packagesStore, hardwareStore, toggleTufUpload, uploadToTuf, fileDropped, devicesStore } = this.props;
        const legacyForm = (
            <Form
                onValid={this.enableButton.bind(this)}
                onInvalid={this.disableButton.bind(this)}
                onValidSubmit={this.submitForm.bind(this, 'legacy')}
                id="package-create-form">
                <AsyncResponse 
                    handledStatus="error"
                    action={packagesStore.packagesCreateAsync}
                    errorMsg={
                        (packagesStore.packagesCreateAsync.data ? 
                            packagesStore.packagesCreateAsync.data.description 
                        : 
                            "An error occured during package creation. Please try again."
                        )
                    }
                />
                <div className="row">
                    <div className="col-xs-6">
                        <FormsyText
                            name="packageName"
                            floatingLabelText="Package name"
                            className="input-wrapper"
                            underlineFocusStyle={!window.atsGarageTheme || window.otaPlusMode ? {borderColor: '#fa9872'} : {}}
                            floatingLabelFocusStyle={!window.atsGarageTheme || window.otaPlusMode ? {color: '#fa9872'} : {}}
                            id="add-new-package-name"
                            updateImmediately
                            required
                        />
                    </div>
                    <div className="col-xs-6">
                        <FormsyText
                            name="version"
                            floatingLabelText="Version"
                            className="input-wrapper"
                            underlineFocusStyle={!window.atsGarageTheme || window.otaPlusMode ? {borderColor: '#fa9872'} : {}}
                            floatingLabelFocusStyle={!window.atsGarageTheme || window.otaPlusMode ? {color: '#fa9872'} : {}}
                            id="add-new-package-version"
                            updateImmediately
                            required
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="col-xs-6">
                        <FormsyText
                            name="description"
                            value=""
                            floatingLabelText="Description"
                            underlineFocusStyle={!window.atsGarageTheme || window.otaPlusMode ? {borderColor: '#fa9872'} : {}}
                            floatingLabelFocusStyle={!window.atsGarageTheme || window.otaPlusMode ? {color: '#fa9872'} : {}}
                            className="input-wrapper"
                            id="add-new-package-description"
                            updateImmediately
                        />
                    </div>
                    <div className="col-xs-6">
                        <FormsyText
                            name="vendor"
                            value=""
                            floatingLabelText="Vendor"
                            underlineFocusStyle={!window.atsGarageTheme || window.otaPlusMode ? {borderColor: '#fa9872'} : {}}
                            floatingLabelFocusStyle={!window.atsGarageTheme || window.otaPlusMode ? {color: '#fa9872'} : {}}
                            className="input-wrapper"
                            id="add-new-package-vendor"
                            updateImmediately
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="col-xs-6">
                        <div className="row">
                            <div className="upload-wrapper col-xs-12">
                                {!fileDropped ?
                                    <FlatButton
                                        label="Choose file"
                                        onClick={this._onFileUploadClick.bind(this)}
                                        className="btn-main btn-small"
                                        id="choose-package"
                                    />
                                    :
                                    null
                                }
                                <div className="file-name">
                                    {fileDropped ?
                                        fileDropped.name
                                        :
                                        this.fileName
                                    }
                                </div>
                                <input
                                    ref="fileUpload"
                                    name="file"
                                    type="file"
                                    onChange={this._onFileChange.bind(this)}
                                    className="file"
                                    id="file-input-hidden"
                                />
                                <FormsyText
                                    type="text"
                                    name="fake-file"
                                    value={fileDropped ?
                                        fileDropped.name
                                        :
                                        this.fileName
                                    }
                                    style={{display: 'none'}}
                                    required
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-xs-12">
                        <div className="body-actions">
                            <a href="#"
                                onClick={this.hideModal.bind(this)}
                                className="link-cancel"
                                id="add-new-package-cancel"
                            >
                                Cancel
                            </a>
                            <FlatButton
                                label="Add package"
                                type="submit"
                                className="btn-main"
                                id="add-new-package-confirm"
                                disabled={this.submitButtonDisabled}
                            />
                        </div>
                    </div>
                </div>
            </Form>
        );
        const directorForm = (
            <Form
                onValid={this.enableButton.bind(this)}
                onInvalid={this.disableButton.bind(this)}
                onValidSubmit={this.submitForm.bind(this, 'director')}
                id="package-create-form">
                <AsyncResponse 
                    handledStatus="error"
                    action={packagesStore.packagesCreateAsync}
                    errorMsg={
                        (packagesStore.packagesCreateAsync.data ? 
                            packagesStore.packagesCreateAsync.data.description 
                        : 
                            "An error occured during package creation. Please try again."
                        )
                    }
                />
                <div className="row">
                    <div className="col-xs-6">
                        <FormsyText
                            name="packageName"
                            floatingLabelText="Package name"
                            className="input-wrapper"
                            underlineFocusStyle={!window.atsGarageTheme || window.otaPlusMode ? {borderColor: '#fa9872'} : {}}
                            floatingLabelFocusStyle={!window.atsGarageTheme || window.otaPlusMode ? {color: '#fa9872'} : {}}
                            id="add-new-package-name"
                            updateImmediately
                            required
                        />
                    </div>
                    <div className="col-xs-6">
                        <FormsyText
                            name="version"
                            floatingLabelText="Version"
                            className="input-wrapper"
                            underlineFocusStyle={!window.atsGarageTheme || window.otaPlusMode ? {borderColor: '#fa9872'} : {}}
                            floatingLabelFocusStyle={!window.atsGarageTheme || window.otaPlusMode ? {color: '#fa9872'} : {}}
                            id="add-new-package-version"
                            updateImmediately
                            required
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="col-xs-6">
                        <div className="hardware-ids-select" id="hardware-ids-select">
                            {hardwareStore.hardwareIdsFetchAsync.isFetching ?
                                <Loader />
                            :
                                <SelectField
                                    id="hardware-ids-select-field"
                                    multiple={true}
                                    onChange={this.selectHardwareIds}
                                    hintText="Select hardware ids"
                                    hintStyle={{opacity: this.selectedHardwareIds.length ? 0 : 1, color: '#b2b2b2', fontWeight: 'bold'}}
                                    value={this.selectedHardwareIds}
                                >
                                    {this.formatHardwareIds(this.selectedHardwareIds)}
                                </SelectField>
                            }
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-xs-6">
                        <div className="row">
                            <div className="upload-wrapper col-xs-12">
                                {!fileDropped ?
                                    <FlatButton
                                        label="Choose file"
                                        onClick={this._onFileUploadClick.bind(this)}
                                        className="btn-main btn-small"
                                        id="choose-package"
                                    />
                                    :
                                    null
                                }
                                <div className="file-name">
                                    {fileDropped ?
                                        fileDropped.name
                                        :
                                        this.fileName
                                    }
                                </div>
                                <input
                                    ref="fileUpload"
                                    name="file"
                                    type="file"
                                    onChange={this._onFileChange.bind(this)}
                                    className="file"
                                    id="file-input-hidden"
                                />
                                <FormsyText
                                    type="text"
                                    name="fake-file"
                                    underlineFocusStyle={!window.atsGarageTheme || window.otaPlusMode ? {borderColor: '#fa9872'} : {}}
                                    floatingLabelFocusStyle={!window.atsGarageTheme || window.otaPlusMode ? {color: '#fa9872'} : {}}
                                    value={fileDropped ?
                                        fileDropped.name
                                        :
                                        this.fileName
                                    }
                                    style={{display: 'none'}}
                                    required
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-xs-12">
                        <div className="body-actions">
                            <a href="#"
                                onClick={this.hideModal.bind(this)}
                                className="link-cancel"
                                id="add-new-package-cancel"
                            >
                                Cancel
                            </a>
                            <FlatButton
                                label="Add package"
                                type="submit"
                                className="btn-main"
                                id="add-new-package-confirm"
                                disabled={this.submitButtonDisabled || !this.selectedHardwareIds.length}
                            />
                        </div>
                    </div>
                </div>
            </Form>
        );
        const commonForm = (
            <div className="common-form">
                <div className="package-manager">
                    <div className="row">
                        <div className="col-xs-12">
                            <div className="row">
                                <div className="switch-row">
                                    <div className="col-xs-2">
                                        <div className={"switch" + (uploadToTuf ? " switchOn" : "")} id="switch" onClick={toggleTufUpload.bind(this)}>
                                            <div className="switch-status">
                                            {uploadToTuf ?
                                                <span id="switch-on">ON</span>
                                            :
                                                <span id="switch-off">OFF</span>
                                            }
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-xs-10">
                                        <div className="tuf-title" id="tuf-title">
                                            TUF repository
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-xs-10 col-xs-offset-2">
                                    <div className="tuf-description" id="tuf-description">
                                        {uploadToTuf ?
                                            <span>
                                                Upload package to the TUF repository and regenerate signed metadata. 
                                                This package will only be installable on devices that were automatically provisioned.
                                            </span>
                                        :
                                            <span>
                                                This package will only be installable on devices that were created with the pre-builds DEB/RPM.
                                            </span>
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Form
                    onValid={this.enableButton.bind(this)}
                    onInvalid={this.disableButton.bind(this)}
                    onValidSubmit={this.submitForm.bind(this, 'common')}
                    id="package-create-form">
                    <AsyncResponse 
                        handledStatus="error"
                        action={packagesStore.packagesCreateAsync}
                        errorMsg={
                            (packagesStore.packagesCreateAsync.data ? 
                                packagesStore.packagesCreateAsync.data.description 
                            : 
                                "An error occured during package creation. Please try again."
                            )
                        }
                    />
                    <div className="row">
                        <div className="col-xs-6">
                            <FormsyText
                                name="packageName"
                                floatingLabelText="Package name"
                                className="input-wrapper"
                                underlineFocusStyle={!window.atsGarageTheme || window.otaPlusMode ? {borderColor: '#fa9872'} : {}}
                                floatingLabelFocusStyle={!window.atsGarageTheme || window.otaPlusMode ? {color: '#fa9872'} : {}}
                                id="add-new-package-name"
                                updateImmediately
                                required
                            />
                        </div>
                        <div className="col-xs-6">
                            <FormsyText
                                name="version"
                                floatingLabelText="Version"
                                className="input-wrapper"
                                underlineFocusStyle={!window.atsGarageTheme || window.otaPlusMode ? {borderColor: '#fa9872'} : {}}
                                floatingLabelFocusStyle={!window.atsGarageTheme || window.otaPlusMode ? {color: '#fa9872'} : {}}
                                id="add-new-package-version"
                                updateImmediately
                                required
                            />
                        </div>
                    </div>
                    {!uploadToTuf ?
                        <div className="row">
                            <div className="col-xs-6">
                                <FormsyText
                                    name="description"
                                    value=""
                                    floatingLabelText="Description"
                                    className="input-wrapper"
                                    underlineFocusStyle={!window.atsGarageTheme || window.otaPlusMode ? {borderColor: '#fa9872'} : {}}
                                    floatingLabelFocusStyle={!window.atsGarageTheme || window.otaPlusMode ? {color: '#fa9872'} : {}}
                                    id="add-new-package-description"
                                    updateImmediately
                                />
                            </div>
                            <div className="col-xs-6">
                                <FormsyText
                                    name="vendor"
                                    value=""
                                    floatingLabelText="Vendor"
                                    className="input-wrapper"
                                    underlineFocusStyle={!window.atsGarageTheme || window.otaPlusMode ? {borderColor: '#fa9872'} : {}}
                                    floatingLabelFocusStyle={!window.atsGarageTheme || window.otaPlusMode ? {color: '#fa9872'} : {}}
                                    id="add-new-package-vendor"
                                    updateImmediately
                                />
                            </div>
                        </div>
                    :
                        null 
                    }
                    {uploadToTuf ?
                        <div className="row">
                            <div className="col-xs-6">
                                <div className="hardware-ids-select" id="hardware-ids-select">
                                    {hardwareStore.hardwareIdsFetchAsync.isFetching ?
                                        <Loader />
                                    :
                                        <SelectField
                                            id="hardware-ids-select-field"
                                            multiple={true}
                                            onChange={this.selectHardwareIds}
                                            hintText="Select hardware ids"
                                            hintStyle={{opacity: this.selectedHardwareIds.length ? 0 : 1, color: '#b2b2b2', fontWeight: 'bold'}}
                                            value={this.selectedHardwareIds}
                                        >
                                            {this.formatHardwareIds(this.selectedHardwareIds)}
                                        </SelectField>
                                    }
                                </div>
                            </div>
                        </div>
                    :
                        null
                    }
                    <div className="row">
                        <div className="col-xs-6">
                            <div className="row">
                                <div className="upload-wrapper col-xs-12">
                                    {!fileDropped ?
                                        <FlatButton
                                            label="Choose file"
                                            onClick={this._onFileUploadClick.bind(this)}
                                            className="btn-main btn-small"
                                            id="choose-package"
                                        />
                                        :
                                        null
                                    }
                                    <div className="file-name">
                                        {fileDropped ?
                                            fileDropped.name
                                            :
                                            this.fileName
                                        }
                                    </div>
                                    <input
                                        ref="fileUpload"
                                        name="file"
                                        type="file"
                                        onChange={this._onFileChange.bind(this)}
                                        className="file"
                                        id="file-input-hidden"
                                    />
                                    <FormsyText
                                        type="text"
                                        name="fake-file"
                                        value={fileDropped ?
                                            fileDropped.name
                                            :
                                            this.fileName
                                        }
                                        style={{display: 'none'}}
                                        required
                                    />
                                </div>
                            </div>
                        </div>                        
                    </div>
                    <div className="row">
                        <div className="col-xs-12">
                            <div className="body-actions">
                                <a href="#"
                                    onClick={this.hideModal.bind(this)}
                                    className="link-cancel"
                                    id="add-new-package-cancel"
                                >
                                    Cancel
                                </a>
                                <FlatButton
                                    label="Add package"
                                    type="submit"
                                    className="btn-main"
                                    id="add-new-package-confirm"
                                    disabled={this.submitButtonDisabled || (uploadToTuf && !this.selectedHardwareIds.length)}
                                />
                            </div>
                        </div>
                    </div>
                </Form>
            </div>
        );
        let shownForm = '';
        if(devicesStore.legacyDevicesCount && devicesStore.directorDevicesCount) {
            shownForm = commonForm;
        } else if(devicesStore.legacyDevicesCount) {
            shownForm = legacyForm;
        } else if(devicesStore.directorDevicesCount) {
            shownForm = directorForm;
        }
        return (
            <Modal 
                title={(
                    <span>
                        <img src="/assets/img/icons/white/packages.png" alt="Icon" className="header-icon" />                    
                        <span className="header-text">Add new package</span>
                    </span>
                )}
                content={shownForm}
                shown={shown}
                className="add-package-modal"
            />
        );
    }
}

CreateModal.propTypes = {
    shown: PropTypes.bool.isRequired,
    hide: PropTypes.func.isRequired,
    packagesStore: PropTypes.object.isRequired,
    hardwareStore: PropTypes.object.isRequired,
    toggleTufUpload: PropTypes.func.isRequired,
    uploadToTuf: PropTypes.bool.isRequired,
    fileDropped: PropTypes.object
}

export default CreateModal;