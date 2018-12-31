import * as React from 'react';
import { IUserEntry, IFileEntry } from '../../../../src';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Icon from '@material-ui/core/Icon';
import Avatar from '@material-ui/core/Avatar';
import DatePicker from 'material-ui-pickers/DatePicker';
import { default as styled } from '../theme/styled';
import { default as theme } from '../theme/mui-theme';
import { generateAvatarPic, isAdminUser } from '../utils/component-utils';
import Drawer from './drawer';
import { MediaModal } from '../containers/media-modal';

type Props = {
  activeUser: IUserEntry<'client' | 'expanded'>;
  selected: IUserEntry<'client' | 'expanded'> | null;
  animated: boolean;
  resetPasswordRequest( username: string ): void;
  activateAccount( username: string ): void;
  onDeleteRequested( username: IUserEntry<'client' | 'expanded'> ): void;
  resendActivation( username: string ): void;
  updateUserAvatar( userId: string, file: IFileEntry<'client' | 'expanded'> ): void;
};

type State = {
  detailsOpen: boolean;
  accountsOpen: boolean;
  removeOpen: boolean;
  showMediaPopup: boolean;
}

export default class UserProperties extends React.Component<Props, State> {

  constructor( props: Props ) {
    super( props );
    this.state = {
      detailsOpen: true,
      accountsOpen: false,
      removeOpen: false,
      showMediaPopup: false
    };
  }

  userCanInteract( user: IUserEntry<'client' | 'expanded'> ) {
    const activeUser = this.props.activeUser;

    // If admin
    if ( activeUser.privileges < 2 )
      return true;

    // If the same user
    if ( activeUser._id === user._id )
      return true;
  }

  render() {
    const selected = this.props.selected;

    if ( !selected )
      return <Properties />;

    const isAdmin = isAdminUser( this.props.activeUser );

    return (
      <Properties className="mt-user-properties">

        <ImgContainer>
          {isAdmin || selected._id === this.props.activeUser._id ? <Button
            variant="fab"
            id="mt-upload-profile"
            color="primary"
            onClick={e => this.setState( { showMediaPopup: true } )}
            style={{ background: theme.primary200.background, bottom: '10px', right: '10px', position: 'absolute' }}
          ><Icon className="icon icon-camera" />
          </Button> : undefined}
          <Avatar
            className="mt-avatar-image"
            src={generateAvatarPic( selected )}
            style={{ display: 'inline-flex', width: 200, height: 200 }}
          />
        </ImgContainer>
        <DetailsContainer>
          <Drawer
            title="User Details"
            animate={this.props.animated}
            open={this.state.detailsOpen}
            onHeaderClick={() => this.setState( { detailsOpen: !this.state.detailsOpen } )}
          >
            <Field>
              <TextField
                className="mt-props-username"
                value={selected.username}
                helperText="Username"
              />
            </Field>
            {this.userCanInteract( selected ) ? <Field>
              <TextField
                className="mt-props-email"
                helperText="Email"
                value={selected.email}
              />
            </Field> : undefined}
            <Field>
              <DatePicker
                helperText="Joined On"
                className="mt-joined-on"
                value={new Date( selected.createdOn )}
                onChange={e => { }}
                format={'MMMM Do, YYYY'}
              />
            </Field>
            {this.userCanInteract( selected ) ? <Field>
              <DatePicker
                helperText="Last Active"
                className="mt-last-active"
                value={new Date( selected.lastLoggedIn )}
                onChange={e => { }}
                format={'MMMM Do, YYYY'}
              />
            </Field> : undefined}
          </Drawer>

          {this.userCanInteract( selected ) ?
            <Drawer
              title="Account Settings"
              animate={this.props.animated}
              className="mt-account-settings"
              onHeaderClick={() => this.setState( { accountsOpen: !this.state.accountsOpen } )}
              open={this.state.accountsOpen}
            >
              <InlineField>
                <div className="mt-inline-label">Send password reset request</div>
                <div className="mt-inline-input">
                  <Tooltip placement="top-start" title="Email user">
                    <IconButton
                      onClick={() => this.props.resetPasswordRequest( selected.username )}
                    >
                      <Icon style={{ color: theme.primary200.background }} className="icon icon-mark-unread mt-reset-password" />
                    </IconButton>
                  </Tooltip>
                </div>
              </InlineField>

              {selected.registerKey !== '' && this.props.activeUser.privileges < 2 ?
                <InlineField>
                  <div className="mt-inline-label">Resend activation email</div>
                  <div className="mt-inline-input">
                    <Tooltip placement="top-start" title="Resent activation code">
                      <IconButton
                        onClick={e => this.props.resendActivation( this.props.selected!.username )}
                      >
                        <Icon
                          style={{ color: theme.primary200.background }}
                          className="icon icon-mark-unread mt-resend-activation" />
                      </IconButton>
                    </Tooltip>
                  </div>
                </InlineField> : undefined}

              {selected.registerKey !== '' && this.props.activeUser.privileges < 2 ?
                <InlineField>
                  <div className="mt-inline-label">Activate Account</div>
                  <div className="mt-inline-input">

                    <Tooltip placement="top-start" title="Activates the user">
                      <IconButton
                        onClick={e => this.props.activateAccount( this.props.selected!.username )}
                      >
                        <Icon
                          style={{ color: theme.primary200.background }}
                          className="icon icon-done mt-activate-account" />
                      </IconButton>
                    </Tooltip>

                  </div>
                </InlineField> : undefined}

            </Drawer>
            : undefined}
          {this.userCanInteract( selected ) ? <Drawer
            title="Remove Account"
            animate={this.props.animated}
            className="mt-remove-account"
            onHeaderClick={() => this.setState( { removeOpen: !this.state.removeOpen } )}
            open={this.state.removeOpen}
          >
            <div className="mt-warning-message">
              Are you absolutely sure you want to remove this account - this is irreversible?
              <br />
              <Button
                variant="contained"
                style={{ background: theme.error.background, color: theme.error.color }}
                className="mt-remove-acc-btn"
                onClick={e => this.props.onDeleteRequested( selected )}
              >Delete Account</Button>
            </div>
          </Drawer> : undefined}
        </DetailsContainer>

        {this.state.showMediaPopup ?
          <MediaModal
            {...{} as any}
            open={true}
            onCancel={() => { this.setState( { showMediaPopup: false } ) }}
            onSelect={file => this.setState( { showMediaPopup: false }, () => this.props.updateUserAvatar( this.props.selected!._id, file ) )}
          /> : undefined}
      </Properties>
    );
  }
}

const Properties = styled.div`
  height: 100%;
  overflow: auto;
  position: relative;
  box-sizing: border-box;
  background: ${theme.light100.background };
  white-space: normal;

  .mt-warning-message {
    text-align: center;
    margin: 20px 0;
    color: ${theme.error.background };
    font-weight: bold;

    > button {
      margin: 10px 0;
    }
  }
`;

const Field = styled.div`
margin: 5px 0;
&:last-child {
  margin-bottom: 20px;
}
> div > label, > div > div > label {
  color: ${ theme.light100.softColor };
}
`;

const InlineField = styled.div`
margin: 15px 5px;
box-sizing: border-box;
display: table;
white-space: normal;
width: 100%;

> div {
  width: 50%;
  display: table-cell;
  vertical-align: middle;
}
.mt-inline-input { text-align: right; }
`;


const ImgContainer = styled.div`
  height: 250px;
  box-sizing: border-box;
  text-align: center;
  padding: 20px;
  background: linear-gradient(-45deg, ${theme.secondary200.background }, ${ theme.primary100.background });
  position: relative;
  overflow: hidden;
`;


const DetailsContainer = styled.div`
  height: calc( 100% - 250px);
  overflow: auto;

  > h3 {
    margin: 0 0 6px 0;
    border-bottom: 1px solid ${ theme.light100.border };
    padding: 0 0 10px 0;
    text-transform: uppercase;
  }
`;