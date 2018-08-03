import React, { Component, PropTypes } from 'react';
import { observable } from 'mobx';
import { observer, inject } from 'mobx-react';
import { Modal, AsyncResponse, Form, FormInput } from '../../partials';
import { FormsyText } from 'formsy-material-ui/lib';
import { FlatButton } from 'material-ui';
import serialize from 'form-serialize';
import { AsyncStatusCallbackHandler } from '../../utils';

@inject('stores')
@observer
class CreateModal extends Component {
    @observable submitButtonDisabled = true;

    constructor(props) {
        super(props);
        const { groupsStore } = props.stores;
        this.createHandler = new AsyncStatusCallbackHandler(groupsStore, 'groupsCreateAsync', this.handleResponse.bind(this));
    }
    componentWillUnmount() {
        this.createHandler();
    }
    enableButton() {
        this.submitButtonDisabled = false;
    }
    disableButton() {
        this.submitButtonDisabled = true;
    }
    submitForm(e) {
        if(e) e.preventDefault();
        const { groupsStore } = this.props.stores;
        let data = serialize(document.querySelector('#group-create-form'), { hash: true });        
        groupsStore.createGroup(data.groupName);
    }
    handleResponse() {
        const { groupsStore } = this.props.stores;
        let data = serialize(document.querySelector('#group-create-form'), { hash: true });
        this.props.selectGroup({type: 'real', groupName: data.groupName, id: groupsStore.latestCreatedGroupId});
        groupsStore._prepareGroups(groupsStore.groups);
        this.props.hide();
    }
    render() {
        const { shown, hide } = this.props;
        const { groupsStore } = this.props.stores;
        const form = (
            <Form                
                onSubmit={this.submitForm.bind(this)}
                id="group-create-form">
                <AsyncResponse 
                    handledStatus="error"
                    action={groupsStore.groupsCreateAsync}
                    errorMsg={(groupsStore.groupsCreateAsync.data ? groupsStore.groupsCreateAsync.data.description : null)}
                />
                <div className="row">
                    <div className="col-xs-8">
                        <div className="group-name-input">
                            <FormInput
                                onValid={this.enableButton.bind(this)}
                                onInvalid={this.disableButton.bind(this)}
                                name="groupName"
                                className="input-wrapper"
                                isEditable={!groupsStore.groupsCreateAsync.isFetching}
                                title={"Group Name"}
                                label={"Group Name"}
                                placeholder={"Name"}
                            />
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-xs-12">
                        <div className="body-actions">
                            <button
                                disabled={this.submitButtonDisabled || groupsStore.groupsCreateAsync.isFetching}
                                className="btn-primary"
                                id="add"
                            >
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            </Form>
        );
        return (
            <Modal 
                title={
                    <div>
                        Create new group
                    </div>
                }
                topActions={
                    <div className="top-actions flex-end">
                        <div className="modal-close" onClick={hide}>
                            <img src="/assets/img/icons/close.svg" alt="Icon" />
                        </div>
                    </div>
                }
                className="create-group-modal"
                content={form}
                shown={shown}
            />
        );
    }
}

CreateModal.propTypes = {
    shown: PropTypes.bool.isRequired,
    hide: PropTypes.func.isRequired,
    selectGroup: PropTypes.func.isRequired,
    stores: PropTypes.object
}

export default CreateModal;