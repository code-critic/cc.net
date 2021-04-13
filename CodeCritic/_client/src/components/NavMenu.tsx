import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CircleLoader } from 'react-spinners';

import {
  AppBar, Avatar, Badge, Box, Container, IconButton, Menu, MenuItem, Toolbar, Tooltip, Typography,
} from '@material-ui/core';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import CancelIcon from '@material-ui/icons/Cancel';
import CodeIcon from '@material-ui/icons/Code';
import FormatSizeIcon from '@material-ui/icons/FormatSize';
import GroupIcon from '@material-ui/icons/Group';
import NotificationsIcon from '@material-ui/icons/Notifications';
import SecurityIcon from '@material-ui/icons/Security';

import { ICcEvent } from '../cc-api';
import { useUser } from '../hooks/useUser';
import { appDispatcher, commentService, getUser, httpClient, superAdmin, updateUser } from '../init';
import { IApiListResponse } from '../models/CustomModel';
import { CcEventType } from '../models/Enums';
import { pageLinks } from '../pageLinks';
import { AbsMoment } from '../renderers/AbsMoment';
import { converter } from '../renderers/markdown';
import { reduceNotifications } from '../utils/notificationUtils';
import { getInitials } from '../utils/utils';
import { SimpleLoader } from './SimpleLoader';
import { CodeCritic } from '../api';
import { NavMenuAdmin } from './NavMenu.Admin';

interface NavMenuProps {

}

interface EventNotificationProps {
  event: ICcEvent;
  groupCount?: number;
}

const EventNotification = (props: EventNotificationProps) => {
  const { event, groupCount = 0 } = props;
  const { sender } = event;
  const initials = getInitials(sender);

  let subject = event.subject;

  if (!subject) {
    switch (event.type as number) {
      case CcEventType.NewCodeReview:
        subject = `**Code Review** request from **${event.sender}**`;
        break;
      case CcEventType.NewComment:
        subject = `**New comment** from **${event.sender}**`;
        break;
      case CcEventType.NewGrade:
        subject = `**New Grade** recieved from **${event.sender}**`;
        break;
    }
  }

  return <>
    <Box display="flex" flexDirection="row" style={{ gap: 10, width: "100%" }}>
      <div>
        <Avatar>{initials}</Avatar>
      </div>
      <div style={{ flexGrow: 1 }}>
        <div className="notification-body" dangerouslySetInnerHTML={{ __html: converter.makeHtml(subject) }} />
        <Typography variant="body2" color="textSecondary" component="div" className="text-right">
          <AbsMoment date={event.id.creationTime} />
          {groupCount > 1 && <span> ({groupCount} notifications)</span>}
        </Typography>
      </div>
    </Box>
  </>
}


export const NavMenu = (props: NavMenuProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuId, setMenuId] = useState<string>();
  const [notifications, setNotifications] = useState<ICcEvent[]>([]);
  const [queue, setQueue] = useState<any[]>([]);
  const [serverState, setServerState] = useState<string>("connected");
  const { user, isRoot, canBeRoot } = useUser();
  const { groups: groupedNotifications, newCount } = reduceNotifications(notifications);

  useEffect(() => {
    appDispatcher.register(payload => {
      switch (payload.actionType) {
        case "newNotification":
          const user = getUser();
          if (user.role) {
            const data = payload.data as ICcEvent[];
            setNotifications(data);
          }
          break;
        case "serverStateChanged":
          setServerState(payload.data as string);
          switch (payload.data as string) {
            case "connected":
              break;
            case "closed":
              break;
          }
          break;
        case "queueStatus":
          setQueue(payload.data);
          break;
      }
    });
    (async () => {
      const axiosResponse = await CodeCritic.api.notificationsGetList();
      const newNotifications = axiosResponse.data.data;
      setNotifications(newNotifications);
    })();
  }, []);


  if (!user.role) {
    return <SimpleLoader />
  }

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuId(undefined);
  };

  const handleNotificationClose = (event: ICcEvent) => {
    switch (event.type as number) {
      case CcEventType.NewCodeReview:
        commentService.markAsRead(event);
        break;
      case CcEventType.NewComment:
      case CcEventType.NewGrade:
        commentService.markAsRead(event);
        break;
    }
    handleMenuClose();
  }

  const openMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setMenuId(event.currentTarget.attributes["aria-controls"].value);
  };

  const badgeColor = isRoot ? "primary" : "secondary";

  const accountMenuId = 'primary-search-account-menu';
  const notificationsMenuId = 'primary-search-notifications-menu';
  const superAdminMenuId = 'super-admin-menu';

  const renderMenu = (
    <>
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        id={accountMenuId}
        keepMounted
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={menuId === accountMenuId}
        onClose={handleMenuClose}
      >
        <MenuItem disabled>{user.username} (<small>{user.id}:<code>{user.role}</code></small>)</MenuItem>
        <MenuItem disabled>roles: (<small>{user.roles.join(", ")}</small>)</MenuItem>

        {isRoot &&
          <MenuItem onClick={() => {
            user.role = "student";
            updateUser(user);
            handleMenuClose();
          }}>
            <SecurityIcon />Switch to role student
        </MenuItem>}

        {isRoot &&
          <MenuItem onClick={() => {
            const newName = prompt("Enter new name", "foo.bar") || user.id;
            httpClient.fetch(`rename/${newName}`)
              .then(data => {
                user.id = newName;
                user.username = newName;
                updateUser(user);
                handleMenuClose();
              });
          }}>
            <FormatSizeIcon />Rename current user
        </MenuItem>
        }
        {!isRoot && canBeRoot &&
          <MenuItem onClick={() => {
            user.role = "root";
            updateUser(user);
            handleMenuClose();
          }}>
            <SecurityIcon />Switch back to root
        </MenuItem>
        }
        <MenuItem component={Link} to={"/manage-groups"} onClick={handleMenuClose}>
          <GroupIcon /> Manage Groups
        </MenuItem>

        <MenuItem onClick={() => {
          fetch("home/logout")
            .then(data => {
              window.location.href = "https://flowdb.nti.tul.cz/secure/";
            })
        }}>
          <CancelIcon />Logout
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        id={notificationsMenuId}
        keepMounted
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={menuId === notificationsMenuId}
        onClose={handleMenuClose}
      >
        {groupedNotifications.map(i => {
          return <MenuItem className={`notification-item ${i.isNew ? "is-new" : "is-old"} notification-type-${i.type}`} key={i.objectId}
            onClick={() => handleNotificationClose(i)}
            component={Link}
            to={`/r/${i.resultObjectId}`}>
            <EventNotification event={i} groupCount={0} />
          </MenuItem>;
        })}
      </Menu>

      <NavMenuAdmin
        open={menuId === superAdminMenuId}
        anchorEl={anchorEl}
        onClose={handleMenuClose} />
    </>
  );

  const availLinks = pageLinks
    .filter(i => !i.rootOnly || (i.rootOnly && user.role === "root"));

  return <>
    <AppBar position="static" className={`nav-menu-root ${isRoot ? "is-root" : "is-student"}`}>
      <Container className="nav-menu-wrapper">
        <Toolbar className="container">
          <IconButton edge="start" color="inherit" component={Link} to="/">
            <CodeIcon />
          </IconButton>
          <Badge className="hide-mobile" badgeContent={1} variant="dot" color={badgeColor}
            anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
            classes={{ badge: `small state-${serverState}` }}>
            {isRoot && <Tooltip title="You are root, student may see things differently">
              <SecurityIcon />
            </Tooltip>}
            <Typography variant="h6">Code Critic</Typography>
          </Badge>

          <div style={{ flexGrow: 1 }} />


          {/* links */}
          {availLinks.map(i =>
            <MenuItem key={i.path} component={Link} to={i.to}>{i.title}</MenuItem>
          )}


          {/* queue status */}
          {queue.length > 0 && <Tooltip title={`Server is running. Currently ${queue.length} item${(queue.length == 1 ? "" : "s")} in queue.`}>
            <IconButton>
              <Badge badgeContent={<>{queue.length}&nbsp;▶</>} color={badgeColor} className="queue-badge">
                <CircleLoader size={24} color="#fff" />
              </Badge>
            </IconButton>
          </Tooltip>}

          {/* notifications */}
          <IconButton
            disabled={notifications.length === 0}
            color="inherit"
            aria-haspopup="true"
            aria-controls={notificationsMenuId}
            onClick={openMenu}>
            <Badge badgeContent={newCount} color={badgeColor}>
              <NotificationsIcon />
            </Badge>
          </IconButton>


          {/* super admin */}
          {isRoot && user.id === superAdmin && <IconButton
            color="inherit"
            aria-haspopup="true"
            aria-controls={superAdminMenuId}
            onClick={openMenu}>
            <SecurityIcon />
          </IconButton>}

          {/* user menu */}
          <IconButton
            color="inherit"
            aria-haspopup="true"
            aria-controls={accountMenuId}
            onClick={openMenu}>
            <AccountCircleIcon />
          </IconButton>

        </Toolbar>
      </Container>
    </AppBar>
    {renderMenu}
  </>
}
