import React, { useState, useEffect } from 'react';
// import { Collapse, Container, Navbar, NavbarBrand, NavbarToggler, NavItem, NavLink } from 'reactstrap';
import { Navbar, Container, NavbarBrand, Collapse, NavItem } from 'react-bootstrap';
import { NavLink, Link } from 'react-router-dom';
import './NavMenu.css';
import { pageLinks } from '../pageLinks';
import { getUser, appDispatcher, commentService, updateUser, httpClient, userIsRoot, userCanBeRoot } from '../init';
import { AppBar, Toolbar, IconButton, Typography, Button, Menu, MenuItem, Badge, Tooltip } from '@material-ui/core';
import CodeIcon from '@material-ui/icons/Code';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import NotificationsIcon from '@material-ui/icons/Notifications';
import CancelIcon from '@material-ui/icons/Cancel';
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount';
import FormatSizeIcon from '@material-ui/icons/FormatSize';
import { SimpleLoader } from './SimpleLoader';
import { ICcEvent } from '../models/DataModel';
import { CcEventType } from '../models/Enums';
import Moment from 'react-moment';
import { withStyles } from "@material-ui/core/styles";
import { groupBy } from '../utils/arrayUtils';
import * as Showdown from "showdown";
import SecurityIcon from '@material-ui/icons/Security';
import { CircleLoader } from 'react-spinners';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';

interface NavMenuProps {

}

interface EventNotificationProps {
  event: ICcEvent;
  groupCount?: number;
}

const converter = new Showdown.Converter({
  tables: true,
  simplifiedAutoLink: true,
  strikethrough: true,
  tasklists: true
});

const EventNotification = (props: EventNotificationProps) => {
  const { event, groupCount } = props;
  let subject = event.subject;

  if (!subject) {
    switch (event.type as number) {
      case CcEventType.NewCodeReview:
        subject = `\`Code Review\` request from \`${event.sender}\``;
        break;
      case CcEventType.NewComment:
        subject = `\`New comment\` from \`${event.sender}\``;
        break;
      case CcEventType.NewGrade:
        subject = `\`New Grade\` recieved from \`${event.sender}\``;
        break;
    }
  }

  return <>
    <div className="notification-body" dangerouslySetInnerHTML={{ __html: converter.makeHtml(subject)}} />

    <Typography variant="body2" color="textSecondary" component="div" style={{ textAlign: "right" }}>
      <Moment date={new Date(event.id.creationTime)} fromNow />
      {(groupCount && groupCount > 1) && <span> ({groupCount} notifications)</span>}
    </Typography>
  </>
}


export const NavMenu = (props: NavMenuProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuId, setMenuId] = useState<string>();
  const [user, setUser] = useState(getUser());
  const [notifications, setNotifications] = useState<ICcEvent[]>([]);
  const [queue, setQueue] = useState<any[]>([]);
  const [serverState, setServerState] = useState<string>("connected");

  useEffect(() => {
    appDispatcher.register(payload => {
      switch (payload.actionType) {
        case "userChanged":
          setUser({ ...getUser() });
          break;
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
          setQueue(payload.data)
          break
      }
    });
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

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setMenuId(event.currentTarget.attributes["aria-controls"].value);
  };

  const isRoot = userIsRoot();
  const canBeRoot = userCanBeRoot();
  const badgeColor = isRoot ? "primary" : "secondary";

  const accountMenuId = 'primary-search-account-menu';
  const notificationsMenuId = 'primary-search-notifications-menu';
  const notifByData = groupBy(notifications, i => i.resultObjectId);
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
        <MenuItem disabled>{user.username} (<small>{user.id}</small>)</MenuItem>
        {isRoot &&
          <MenuItem onClick={() => {
            user.role = "student";
            setUser(user);
            updateUser(user);
            handleMenuClose();
          }}>
            <SupervisorAccountIcon />Switch to role student
        </MenuItem>
        }
        {isRoot &&
          <MenuItem onClick={() => {
            const newName = prompt("Enter new name", "foo.bar") || user.id;
            httpClient.fetch(`rename/${newName}`)
              .then(data => {
                user.id = newName;
                user.username = newName;
                setUser(user);
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
            setUser(user);
            updateUser(user);
            handleMenuClose();
          }}>
            <SupervisorAccountIcon />Switch back to root
        </MenuItem>
        }
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
        {[...notifByData.entries()].map(entry => {
          const [_, items] = entry;
          const i = items[0];
          return <MenuItem className="notification-item" key={i.objectId}
            onClick={() => handleNotificationClose(i)}
            component={Link}
            to={`/r/${i.resultObjectId}`}>
              <EventNotification event={i} groupCount={items.length} />
          </MenuItem>;
        })}
      </Menu>
    </>
  );

  const availLinks = pageLinks
    .filter(i => !i.rootOnly || (i.rootOnly && user.role === "root"));

  return <>
    <AppBar position="static" className={`mb-2 ${isRoot ? "is-root" : "is-student"}`}>
      <Toolbar className="container">
        <IconButton edge="start" color="inherit" component={Link} to="/">
          <CodeIcon />
        </IconButton>
        <Badge badgeContent={1} variant="dot" color={badgeColor}
          anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
          classes={{ badge: `small state-${serverState}` }}>
          {isRoot && <Tooltip title="You are root, student may see things differently">
            <SecurityIcon />
          </Tooltip>}
          <Typography variant="h6">Code Critic</Typography>
        </Badge>

        <div style={{ flexGrow: 1 }} />


        {availLinks.map(i =>
          <MenuItem key={i.path} component={Link} to={i.to}>{i.title}</MenuItem>
        )}

        {/* queue status */}
        {queue.length > 0 && <Tooltip title={`Server is running. Currently ${queue.length} item${(queue.length == 1 ? "" : "s")} in queue.`}>
          <IconButton>
            <Badge badgeContent={<PlayArrowIcon />} color={badgeColor} className="queue-badge">
                <CircleLoader size={24} color="#fff" />
            </Badge>
          </IconButton>
        </Tooltip>}

        {/* notifications */}
        <IconButton
          disabled={notifications.length === 0}
          edge="end"
          color="inherit"
          aria-haspopup="true"
          aria-controls={notificationsMenuId}
          onClick={handleProfileMenuOpen}>
          <Badge badgeContent={notifByData.size + 5} color={badgeColor}>
            <NotificationsIcon />
          </Badge>
        </IconButton>

        {/* user menu */}
        <IconButton
          color="inherit"
          aria-haspopup="true"
          aria-controls={accountMenuId}
          onClick={handleProfileMenuOpen}>
          <AccountCircleIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
    {renderMenu}
  </>
}
