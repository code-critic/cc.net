import React, { useState, useEffect } from 'react';
// import { Collapse, Container, Navbar, NavbarBrand, NavbarToggler, NavItem, NavLink } from 'reactstrap';
import { Navbar, Container, NavbarBrand, Collapse, NavItem } from 'react-bootstrap';
import { NavLink, Link } from 'react-router-dom';
import './NavMenu.css';
import { pageLinks } from '../pageLinks';
import { getUser, appDispatcher, commentService, updateUser, httpClient } from '../init';
import { AppBar, Toolbar, IconButton, Typography, Button, Menu, MenuItem, Badge } from '@material-ui/core';
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

interface NavMenuProps {

}

interface EventNotificationProps {
  event: ICcEvent;
}

const EventNotification = (props: EventNotificationProps) => {
  const { event } = props;
  let subject = event.subject;

  if (!subject) {
    switch (event.type as number) {
      case CcEventType.NewCodeReview:
        subject = `Code Review Request from ${event.sender}`;
        break;
      case CcEventType.NewComment:
        subject = `New comment from ${event.sender}`;
        break;
      case CcEventType.NewGrade:
        subject = `Grade recieved from ${event.sender}`;
        break;
    }
  }

  return <div>
    <div>
      {subject}
    </div>

    <Typography variant="body2" color="textSecondary" component="div" style={{textAlign: "right"}}>
      <Moment date={new Date(event.id.creationTime)} fromNow/>
    </Typography>
  </div>
}


export const NavMenu = (props: NavMenuProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuId, setMenuId] = useState<string>();
  const [user, setUser] = useState(getUser());
  const [notifications, setNotifications] = useState<ICcEvent[]>([]);

  useEffect(() => {
    appDispatcher.register(payload => {
      switch (payload.actionType) {
        case "userChanged":
          setUser({...getUser()});
          break;
        case "newNotification":
          const user = getUser();
          if (user.role) {
            const data = payload.data as ICcEvent[];
            setNotifications(data.filter(i => i.reciever == user.id));
          }
          break;
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

  const isRoot = user.role === "root";
  const canBeRoot = !!~user.roles.indexOf("root");

  const accountMenuId = 'primary-search-account-menu';
  const notificationsMenuId = 'primary-search-notifications-menu';
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
        {notifications.map(i => <MenuItem key={i.objectId}
          onClick={() => handleNotificationClose(i)}
          component={Link}
          to={`/r/${i.resultObjectId}`}>
          <EventNotification event={i} />
        </MenuItem>)}
      </Menu>
    </>
  );

  const availLinks = pageLinks
    .filter(i => !i.rootOnly || (i.rootOnly && user.role === "root"));

  return <>
    <AppBar position="static" className="mb-2">
      <Toolbar className="container">
        <IconButton edge="start" color="inherit" component={Link} to="/">
          <CodeIcon />
        </IconButton>
        <Typography variant="h6">Code Critic</Typography>

        <div style={{ flexGrow: 1 }} />


        {availLinks.map(i =>
          <MenuItem key={i.path} component={Link} to={i.to}>{i.title}</MenuItem>
        )}
        <IconButton
          disabled={notifications.length === 0}
          edge="end"
          color="inherit"
          aria-haspopup="true"
          aria-controls={notificationsMenuId}
          onClick={handleProfileMenuOpen}>
          <Badge badgeContent={notifications.length} color="secondary">
            <NotificationsIcon />
          </Badge>
        </IconButton>

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
