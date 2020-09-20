import * as React from 'react';
import { File, UserPrivilege, UpdateUserInput, User } from 'mantle';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import Fab from '@material-ui/core/Fab';
import TextField from '@material-ui/core/TextField';
import Icon from '@material-ui/core/Icon';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Avatar from '@material-ui/core/Avatar';
import { DatePicker } from '@material-ui/pickers';
import { default as styled } from '../../theme/styled';
import { default as theme } from '../../theme/mui-theme';
import { generateAvatarPic, isAdminUser } from '../../utils/component-utils';
import MediaModal from '../../containers/media-modal';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser';
import SettingsIcon from '@material-ui/icons/Settings';
import DeleteIcon from '@material-ui/icons/Delete';

type Props = {
  activeUser: User;
  selected: User | null;
  animated: boolean;
  updateUserDetails: (user: Partial<UpdateUserInput>) => void;
  resetPasswordRequest(username: string): void;
  activateAccount(username: string): void;
  onDeleteRequested(username: User): void;
  resendActivation(username: string): void;
  updateUserAvatar(userId: string, file: File): void;
};

type State = {
  detailsOpen: boolean;
  accountsOpen: boolean;
  removeOpen: boolean;
  showMediaPopup: boolean;
  user: User | null;
};

export default class UserProperties extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      detailsOpen: true,
      accountsOpen: false,
      removeOpen: false,
      showMediaPopup: false,
      user: props.selected ? { ...props.selected } : null,
    };
  }

  componentWillReceiveProps(next: Props) {
    if (next.selected !== this.props.selected) this.setState({ user: next.selected ? { ...next.selected } : null });
  }

  userCanInteract(user: User) {
    const activeUser = this.props.activeUser;

    // If admin
    if (activeUser.privileges === 'admin' || activeUser.privileges === 'super') return true;

    // If the same user
    if (activeUser._id === user._id) return true;
  }

  render() {
    const selected = this.props.selected;

    if (!selected) return <Properties animated={this.props.animated} />;

    const isAdmin = isAdminUser(this.props.activeUser);

    return (
      <Properties className="mt-user-properties" animated={this.props.animated}>
        <ImgContainer>
          {isAdmin || selected._id === this.props.activeUser._id ? (
            <Fab
              id="mt-upload-profile"
              color="primary"
              onClick={(e) => this.setState({ showMediaPopup: true })}
              style={{ background: theme.primary200.background, bottom: '10px', right: '10px', position: 'absolute' }}
            >
              <Icon className="icon icon-camera" />
            </Fab>
          ) : undefined}
          <Avatar
            className="mt-avatar-image"
            src={generateAvatarPic(selected)}
            style={{ display: 'inline-flex', width: 200, height: 200 }}
          />
        </ImgContainer>

        <DetailsContainer>
          <ExpansionPanel defaultExpanded={true} className="mt-tags-panel">
            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon className="mt-panel-expand" />}>
              <h3>
                <Icon className="mt-panel-icon">
                  <VerifiedUserIcon />
                </Icon>{' '}
                <span className="mt-panel-header">User Details</span>
              </h3>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <div style={{ flex: 1 }}>
                <Field>
                  <TextField
                    className="mt-props-username"
                    value={selected.username}
                    disabled={true}
                    helperText="Username"
                    fullWidth={true}
                  />
                </Field>
                {this.userCanInteract(selected) ? (
                  <Field>
                    <TextField
                      className="mt-props-email"
                      helperText="Email"
                      id="mt-user-email"
                      disabled={isAdmin ? false : true}
                      onChange={
                        isAdmin
                          ? (e) => this.setState({ user: { ...this.state.user!, email: e.currentTarget.value } })
                          : undefined
                      }
                      value={isAdmin ? this.state.user!.email! : this.props.activeUser.email!}
                      fullWidth={true}
                    />
                  </Field>
                ) : undefined}
                <Field>
                  <DatePicker
                    helperText="Joined On"
                    className="mt-joined-on"
                    value={new Date(this.state.user!.createdOn)}
                    onChange={(e: Date) => this.setState({ user: { ...this.state.user!, createdOn: e.getTime() } })}
                    fullWidth={true}
                    disabled={isAdmin ? false : true}
                    format={'MMMM Do, yyyy'}
                  />
                </Field>
                {this.userCanInteract(selected) ? (
                  <Field>
                    <DatePicker
                      helperText="Last Active"
                      disabled={true}
                      className="mt-last-active"
                      fullWidth={true}
                      value={new Date(selected.lastLoggedIn)}
                      onChange={(e: Date) => {}}
                      format={'MMMM Do, yyyy'}
                    />
                  </Field>
                ) : undefined}
                {isAdmin ? (
                  <Field>
                    <FormControl fullWidth={true}>
                      <Select
                        className="mt-user-type"
                        fullWidth={true}
                        value={this.state.user!.privileges}
                        onChange={(e) =>
                          this.setState({ user: { ...this.state.user!, privileges: e.target.value as UserPrivilege } })
                        }
                        inputProps={{
                          fullWidth: true,
                        }}
                      >
                        <MenuItem id="mt-type-super" value={'super'} disabled={true}>
                          Super Admin
                        </MenuItem>
                        <MenuItem id="mt-type-admin" value={'admin'}>
                          Admin
                        </MenuItem>
                        <MenuItem id="mt-type-user" value={'regular'}>
                          User
                        </MenuItem>
                      </Select>
                      <FormHelperText>User Type</FormHelperText>
                    </FormControl>
                  </Field>
                ) : undefined}
                {isAdmin ? (
                  <Field>
                    <Button
                      variant="contained"
                      id="mt-save-user-details"
                      color="primary"
                      fullWidth={true}
                      onClick={(e) => {
                        const changes = this.state.user!;
                        this.props.updateUserDetails({
                          email: changes.email!,
                          privileges: changes.privileges,
                          _id: changes._id,
                        });
                      }}
                    >
                      Update Details
                    </Button>
                  </Field>
                ) : undefined}
              </div>
            </ExpansionPanelDetails>
          </ExpansionPanel>

          {this.userCanInteract(selected) ? (
            <ExpansionPanel className="mt-tags-panel">
              <ExpansionPanelSummary expandIcon={<ExpandMoreIcon className="mt-account-settings" />}>
                <h3>
                  <Icon className="mt-panel-icon">
                    <SettingsIcon />
                  </Icon>{' '}
                  <span className="mt-panel-header">Account Settings</span>
                </h3>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <div style={{ flex: 1 }}>
                  <InlineField>
                    <div className="mt-inline-label">Send password reset request</div>
                    <div className="mt-inline-input">
                      <Tooltip placement="top-start" title="Email user">
                        <IconButton onClick={() => this.props.resetPasswordRequest(selected.username)}>
                          <Icon
                            style={{ color: theme.primary200.background }}
                            className="icon icon-mark-unread mt-reset-password"
                          />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </InlineField>

                  {selected.registerKey !== '' && isAdmin ? (
                    <InlineField>
                      <div className="mt-inline-label">Resend activation email</div>
                      <div className="mt-inline-input">
                        <Tooltip placement="top-start" title="Resent activation code">
                          <IconButton onClick={(e) => this.props.resendActivation(this.props.selected!.username)}>
                            <Icon
                              style={{ color: theme.primary200.background }}
                              className="icon icon-mark-unread mt-resend-activation"
                            />
                          </IconButton>
                        </Tooltip>
                      </div>
                    </InlineField>
                  ) : undefined}

                  {selected.registerKey !== '' && isAdmin ? (
                    <InlineField>
                      <div className="mt-inline-label">Activate Account</div>
                      <div className="mt-inline-input">
                        <Tooltip placement="top-start" title="Activates the user">
                          <IconButton onClick={(e) => this.props.activateAccount(this.props.selected!.username)}>
                            <Icon
                              style={{ color: theme.primary200.background }}
                              className="icon icon-done mt-activate-account"
                            />
                          </IconButton>
                        </Tooltip>
                      </div>
                    </InlineField>
                  ) : undefined}
                </div>
              </ExpansionPanelDetails>
            </ExpansionPanel>
          ) : undefined}

          {this.userCanInteract(selected) ? (
            <ExpansionPanel>
              <ExpansionPanelSummary expandIcon={<ExpandMoreIcon className="mt-remove-account" />}>
                <h3>
                  <Icon className="mt-panel-icon">
                    <DeleteIcon />
                  </Icon>{' '}
                  <span className="mt-panel-header">Remove Account</span>
                </h3>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <div className="mt-warning-message">
                  Are you absolutely sure you want to remove this account - this is irreversible?
                  <br />
                  <Button
                    variant="contained"
                    style={{ background: theme.error.background, color: theme.error.color }}
                    className="mt-remove-acc-btn"
                    onClick={(e) => this.props.onDeleteRequested(selected)}
                  >
                    Delete Account
                  </Button>
                </div>
              </ExpansionPanelDetails>
            </ExpansionPanel>
          ) : undefined}
        </DetailsContainer>

        {this.state.showMediaPopup ? (
          <MediaModal
            open={true}
            onCancel={() => {
              this.setState({ showMediaPopup: false });
            }}
            onSelect={(file) =>
              this.setState({ showMediaPopup: false }, () =>
                this.props.updateUserAvatar(this.props.selected!._id as string, file)
              )
            }
          />
        ) : undefined}
      </Properties>
    );
  }
}

interface UserPropsStyleProps extends React.HTMLAttributes<HTMLElement> {
  animated: boolean;
}

const Properties = styled.div`
  height: 100%;
  overflow: auto;
  position: relative;
  box-sizing: border-box;
  white-space: normal;
  ${(props: UserPropsStyleProps) => (!props.animated ? '* { transition: none !important; }' : '')}

  h3 {
    margin: 0;
  }

  .mt-panel-icon {
    margin: 0 10px 0 0;
    color: ${theme.additionalColors.light};
    vertical-align: middle;
  }

  .mt-warning-message {
    text-align: center;
    margin: 20px 0;
    color: ${theme.error.background};
    font-weight: bold;
    flex: 1;

    > button {
      margin: 25px 0 0 0;
    }
  }
`;

const Field = styled.div`
  margin: 0 0 15px 0;
  &:last-child {
    margin-bottom: 20px;
  }
  > div > label,
  > div > div > label {
    color: ${theme.light100.softColor};
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
  .mt-inline-input {
    text-align: right;
  }
`;

const ImgContainer = styled.div`
  height: 250px;
  box-sizing: border-box;
  text-align: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
`;

const DetailsContainer = styled.div`
  height: calc(100% - 250px);
  overflow: auto;

  > div {
    margin-left: 10px;
    margin-right: 10px;

    &:first-child {
      margin-top: 10px;
    }
  }

  > h3 {
    margin: 0 0 6px 0;
    border-bottom: 1px solid ${theme.light100.border};
    padding: 0 0 10px 0;
    text-transform: uppercase;
  }
`;
