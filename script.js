// Simulated in-memory database
let users = [
  {
    username: 'model1',
    password: 'pass',
    role: 'creator',
    subscriptionPrice: 10,
    pictures: [
      { id: 1, color: [255, 100, 100], width: 50, height: 100, likes: [], comments: [], createdAt: Date.now() },
      { id: 2, color: [100, 255, 100], width: 45, height: 90, likes: [], comments: [], createdAt: Date.now() }
    ],
    tipMenu: [
      { item: 'Custom Foot Pic', price: 5 },
      { item: 'Video Message', price: 15 },
      { item: 'Exclusive Set', price: 25 }
    ],
    stories: [{ id: 1, color: [200, 200, 200], width: 40, height: 80, createdAt: Date.now() }],
    subscriptions: [],
    notifications: [],
    messages: []
  },
  {
    username: 'sub1',
    password: 'pass',
    role: 'user',
    subscriptions: ['model1'],
    notifications: [],
    messages: [],
    bookmarks: []
  },
  {
    username: 'admin1',
    password: 'pass',
    role: 'admin',
    notifications: []
  }
];
let currentUser = null;
let currentState = 0;
let currentModel = null;
let currentPage = 1;
const picturesPerPage = 6;
const subscriptionPlans = [0, 10, 15, 20, 30, 40, 50];

// DOM elements
let landingDiv, loginDiv, signupDiv, creatorProfileDiv, userHomeDiv, modelPicturesDiv, adminPanelDiv, chatDiv;
let loginUsernameInput, loginPasswordInput, loginErrorP;
let signupUsernameInput, signupPasswordInput, signupConfirmInput, signupRoleRadio, signupErrorP;
let priceSelect, uploadSuccessP, tipMenuDiv, paginationDiv, notificationsDiv, storiesDiv;

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Landing Page
  landingDiv = createDiv().class('page').id('landing');
  createElement('h1', 'Footish').parent(landingDiv);
  createP('Exclusive Foot Content Platform').parent(landingDiv);
  createButton('Login').parent(landingDiv).class('button').mousePressed(() => setState(1));
  createButton('Signup').parent(landingDiv).class('button').mousePressed(() => setState(2));

  // Login Page
  loginDiv = createDiv().class('page').id('login').hide();
  createElement('h2', 'Login').parent(loginDiv);
  createP('Username:').parent(loginDiv);
  loginUsernameInput = createInput('').parent(loginDiv);
  createP('Password:').parent(loginDiv);
  loginPasswordInput = createInput('').parent(loginDiv).attribute('type', 'password');
  createButton('Login').parent(loginDiv).class('button').mousePressed(login);
  createButton('Back').parent(loginDiv).class('button').mousePressed(() => setState(0));
  loginErrorP = createP('').parent(loginDiv).class('error');

  // Signup Page
  signupDiv = createDiv().class('page').id('signup').hide();
  createElement('h2', 'Signup').parent(signupDiv);
  createP('Username:').parent(signupDiv);
  signupUsernameInput = createInput('').parent(signupDiv);
  createP('Password:').parent(signupDiv);
  signupPasswordInput = createInput('').parent(signupDiv).attribute('type', 'password');
  createP('Confirm Password:').parent(signupDiv);
  signupConfirmInput = createInput('').parent(signupDiv).attribute('type', 'password');
  createP('Role:').parent(signupDiv);
  signupRoleRadio = createRadio().parent(signupDiv);
  signupRoleRadio.option('creator', 'Creator');
  signupRoleRadio.option('user', 'Subscriber');
  signupRoleRadio.selected('creator');
  createButton('Signup').parent(signupDiv).class('button').mousePressed(signup);
  createButton('Back').parent(signupDiv).class('button').mousePressed(() => setState(0));
  signupErrorP = createP('').parent(signupDiv).class('error');

  // Creator Profile Page
  creatorProfileDiv = createDiv().class('page').id('creatorProfile').hide();
  createElement('h2', '').parent(creatorProfileDiv).id('creatorWelcome');
  createP('Subscription Price ($):').parent(creatorProfileDiv);
  priceSelect = createSelect().parent(creatorProfileDiv);
  subscriptionPlans.forEach(plan => priceSelect.option(plan));
  createButton('Save Price').parent(creatorProfileDiv).class('button').mousePressed(savePrice);
  createButton('Upload Picture').parent(creatorProfileDiv).class('button').mousePressed(uploadPicture);
  createButton('Post Story').parent(creatorProfileDiv).class('button').mousePressed(postStory);
  createButton('Send Message to All Subscribers').parent(creatorProfileDiv).class('button').mousePressed(bulkMessage);
  tipMenuDiv = createDiv().parent(creatorProfileDiv).class('tip-menu').id('tipMenu');
  notificationsDiv = createDiv().parent(creatorProfileDiv).class('notifications').id('notifications');
  createButton('View Messages').parent(creatorProfileDiv).class('button').mousePressed(() => setState(6));
  createButton('Logout').parent(creatorProfileDiv).class('button').mousePressed(logout);

  // User Home Page
  userHomeDiv = createDiv().class('page').id('userHome').hide();
  createElement('h2', '').parent(userHomeDiv).id('userWelcome');
  storiesDiv = createDiv().parent(userHomeDiv).class('story').id('stories');
  createDiv().parent(userHomeDiv).id('modelList');
  notificationsDiv = createDiv().parent(userHomeDiv).class('notifications').id('notifications');
  createButton('View Messages').parent(userHomeDiv).class('button').mousePressed(() => setState(6));
  createButton('Logout').parent(userHomeDiv).class('button').mousePressed(logout);

  // Model Pictures Page
  modelPicturesDiv = createDiv().class('page').id('modelPictures').hide();
  createElement('h2', '').parent(modelPicturesDiv).id('picturesTitle');
  createDiv().parent(modelPicturesDiv).class('gallery').id('gallery');
  paginationDiv = createDiv().parent(modelPicturesDiv).class('pagination').id('pagination');
  createButton('Back').parent(modelPicturesDiv).class('button').mousePressed(() => setState(4));

  // Chat Page
  chatDiv = createDiv().class('page').id('chat').hide();
  createElement('h2', 'Messages').parent(chatDiv);
  createDiv().parent(chatDiv).class('chat').id('chatMessages');
  createP('Message:').parent(chatDiv);
  let messageInput = createInput('').parent(chatDiv);
  createButton('Send').parent(chatDiv).class('button').mousePressed(() => sendMessage(messageInput));
  createButton('Back').parent(chatDiv).class('button').mousePressed(() => setState(currentUser.role === 'creator' ? 3 : 4));

  // Admin Panel
  adminPanelDiv = createDiv().class('page').id('adminPanel').hide();
  createElement('h2', 'Admin Panel').parent(adminPanelDiv);
  createDiv().parent(adminPanelDiv).id('adminUsers');
  createP('Email Message:').parent(adminPanelDiv);
  let emailInput = createInput('').parent(adminPanelDiv);
  createButton('Send Email to All').parent(adminPanelDiv).class('button').mousePressed(() => sendAdminEmail(emailInput, 'all'));
  createButton('Send Email to Creators').parent(adminPanelDiv).class('button').mousePressed(() => sendAdminEmail(emailInput, 'creators'));
  createButton('Logout').parent(adminPanelDiv).class('button').mousePressed(logout);

  setState(0);
}

function draw() {
  background(30);
  // Cleanup expired stories (older than 24 hours)
  users.forEach(user => {
    if (user.stories) {
      user.stories = user.stories.filter(story => Date.now() - story.createdAt < 24 * 60 * 60 * 1000);
    }
  });
}

function setState(state) {
  [landingDiv, loginDiv, signupDiv, creatorProfileDiv, userHomeDiv, modelPicturesDiv, chatDiv, adminPanelDiv].forEach(div => {
    div.hide().removeClass('visible').addClass('hidden');
  });
  currentPage = 1;
  if (state === 0) landingDiv.show().addClass('visible').removeClass('hidden');
  else if (state === 1) loginDiv.show().addClass('visible').removeClass('hidden');
  else if (state === 2) signupDiv.show().addClass('visible').removeClass('hidden');
  else if (state === 3) {
    creatorProfileDiv.show().addClass('visible').removeClass('hidden');
    populateCreatorProfile();
  } else if (state === 4) {
    userHomeDiv.show().addClass('visible').removeClass('hidden');
    populateUserHome();
  } else if (state === 5) {
    modelPicturesDiv.show().addClass('visible').removeClass('hidden');
    populateModelPictures(currentModel);
  } else if (state === 6) {
    chatDiv.show().addClass('visible').removeClass('hidden');
    populateChat();
  } else if (state === 7) {
    adminPanelDiv.show().addClass('visible').removeClass('hidden');
    populateAdminPanel();
  }
  currentState = state;
}

function login() {
  let username = loginUsernameInput.value().trim();
  let password = loginPasswordInput.value().trim();
  if (!username || !password) {
    loginErrorP.html('Please enter both username and password');
    return;
  }
  let user = users.find(u => u.username === username && u.password === password);
  if (user) {
    currentUser = user;
    setState(user.role === 'creator' ? 3 : user.role === 'admin' ? 7 : 4);
    loginErrorP.html('');
    loginUsernameInput.value('');
    loginPasswordInput.value('');
    addNotification(user, `Logged in as ${username}`);
  } else {
    loginErrorP.html('Invalid username or password');
  }
}

function signup() {
  let username = signupUsernameInput.value().trim();
  let password = signupPasswordInput.value().trim();
  let confirm = signupConfirmInput.value().trim();
  let role = signupRoleRadio.value();
  if (!username || !password || !confirm) {
    signupErrorP.html('Please fill in all fields');
    return;
  }
  if (users.find(u => u.username === username)) {
    signupErrorP.html('Username already taken');
    return;
  }
  if (password !== confirm) {
    signupErrorP.html('Passwords do not match');
    return;
  }
  let newUser = {
    username,
    password,
    role,
    subscriptionPrice: role === 'creator' ? 10 : undefined,
    pictures: role === 'creator' ? [] : undefined,
    tipMenu: role === 'creator' ? [
      { item: 'Custom Foot Pic', price: 5 },
      { item: 'Video Message', price: 15 },
      { item: 'Exclusive Set', price: 25 }
    ] : undefined,
    stories: role === 'creator' ? [] : undefined,
    subscriptions: role === 'user' ? [] : undefined,
    notifications: [],
    messages: [],
    bookmarks: role === 'user' ? [] : undefined
  };
  users.push(newUser);
  currentUser = newUser;
  setState(role === 'creator' ? 3 : role === 'admin' ? 7 : 4);
  signupErrorP.html('');
  signupUsernameInput.value('');
  signupPasswordInput.value('');
  signupConfirmInput.value('');
  addNotification(newUser, `Account created: ${username}`);
}

function logout() {
  currentUser = null;
  currentModel = null;
  currentPage = 1;
  setState(0);
}

function savePrice() {
  let price = parseFloat(priceSelect.value());
  if (isNaN(price)) {
    uploadSuccessP.html('Please select a valid price').show().class('error');
    setTimeout(() => uploadSuccessP.hide(), 2000);
    return;
  }
  currentUser.subscriptionPrice = price;
  uploadSuccessP.html('Price updated successfully').show().class('success');
  setTimeout(() => uploadSuccessP.hide(), 2000);
  addNotification(currentUser, `Subscription price updated to $${price}`);
  populateCreatorProfile();
}

function uploadPicture() {
  let params = {
    id: Date.now(),
    color: [random(255), random(255), random(255)],
    width: random(40, 60),
    height: random(80, 120),
    likes: [],
    comments: [],
    createdAt: Date.now()
  };
  currentUser.pictures.push(params);
  uploadSuccessP.html('Picture uploaded successfully').show().class('success');
  setTimeout(() => uploadSuccessP.hide(), 2000);
  addNotification(currentUser, 'New picture uploaded');
  users.forEach(user => {
    if (user.subscriptions && user.subscriptions.includes(currentUser.username)) {
      addNotification(user, `${currentUser.username} uploaded a new picture`);
    }
  });
}

function postStory() {
  let params = {
    id: Date.now(),
    color: [random(255), random(255), random(255)],
    width: random(40, 60),
    height: random(80, 120),
    createdAt: Date.now()
  };
  currentUser.stories.push(params);
  uploadSuccessP.html('Story posted successfully').show().class('success');
  setTimeout(() => uploadSuccessP.hide(), 2000);
  addNotification(currentUser, 'New story posted');
  users.forEach(user => {
    if (user.subscriptions && user.subscriptions.includes(currentUser.username)) {
      addNotification(user, `${currentUser.username} posted a new story`);
    }
  });
}

function createFootPicture(params) {
  let pg = createGraphics(140, 210);
  pg.background(255);
  pg.fill(...params.color);
  pg.noStroke();
  pg.ellipse(70, 105, params.width, params.height);
  for (let i = -2; i <= 2; i++) {
    pg.ellipse(70 + i * 14, 35, 14, 28);
  }
  return pg;
}

function populateCreatorProfile() {
  select('#creatorWelcome').html(`Creator Dashboard: ${currentUser.username}`);
  priceSelect.value(currentUser.subscriptionPrice || 10);
  let tipMenu = select('#tipMenu');
  tipMenu.html('');
  createElement('h3', 'Tip Menu').parent(tipMenu);
  currentUser.tipMenu.forEach(tip => {
    let itemDiv = createDiv().parent(tipMenu).class('tip-item');
    createP(`${tip.item}: $${tip.price}`).parent(itemDiv);
  });
  let notifications = select('#notifications');
  notifications.html('');
  createElement('h3', 'Notifications').parent(notifications);
  currentUser.notifications.slice(-5).forEach(note => {
    createP(note).parent(notifications).class('notification');
  });
}

function populateUserHome() {
  select('#userWelcome').html(`Welcome, ${currentUser.username}`);
  let stories = select('#stories');
  stories.html('');
  createElement('h3', 'Stories').parent(stories);
  let subscribedCreators = users.filter(u => currentUser.subscriptions.includes(u.username) && u.stories && u.stories.length > 0);
  subscribedCreators.forEach(creator => {
    creator.stories.forEach(story => {
      let storyDiv = createDiv().parent(stories).class('story');
      createP(`${creator.username}'s Story`).parent(storyDiv);
      let pg = createFootPicture(story);
      storyDiv.child(pg.elt);
    });
  });
  let list = select('#modelList');
  list.html('');
  createElement('h3', 'Creators').parent(list);
  users.filter(u => u.role === 'creator').forEach(model => {
    let card = createDiv().parent(list).class('model-card');
    createP(`${model.username} - $${model.subscriptionPrice || 10} (${model.pictures ? model.pictures.length : 0} pics)`).parent(card);
    if (currentUser.subscriptions.includes(model.username)) {
      createButton('View Pictures').parent(card).class('button').mousePressed(() => {
        currentModel = model;
        currentPage = 1;
        setState(5);
      });
      createButton('Tip').parent(card).class('button').mousePressed(() => {
        alert(`Tipping ${model.username}: Choose from ${model.tipMenu.map(t => `${t.item} ($${t.price})`).join(', ')}`);
        addNotification(model, `${currentUser.username} sent a tip`);
      });
    } else {
      createButton('Subscribe').parent(card).class('button').mousePressed(() => {
        let plan = prompt(`Choose a subscription plan for ${model.username} (${model.subscriptionPrice}$/month): ${subscriptionPlans.join(', ')}`, model.subscriptionPrice);
        plan = parseFloat(plan);
        if (subscriptionPlans.includes(plan)) {
          currentUser.subscriptions.push(model.username);
          alert(`Simulated Stripe payment of $${plan} for ${model.username}`);
          uploadSuccessP.html(`Subscribed to ${model.username} for $${plan}`).show().class('success');
          setTimeout(() => uploadSuccessP.hide(), 2000);
          addNotification(currentUser, `Subscribed to ${model.username}`);
          addNotification(model, `${currentUser.username} subscribed to you`);
          populateUserHome();
        } else {
          uploadSuccessP.html('Invalid subscription plan').show().class('error');
          setTimeout(() => uploadSuccessP.hide(), 2000);
        }
      });
    }
    if (model.pictures && model.pictures.length > 0) {
      model.pictures.slice(-2).forEach(pic => {
        let postDiv = createDiv().parent(list).class('post');
        createP(`${model.username}'s Post`).parent(postDiv);
        let pg = createFootPicture(pic);
        postDiv.child(pg.elt);
        let likeButton = createButton(`Like (${pic.likes.length})`).parent(postDiv).class('button').mousePressed(() => {
          if (!pic.likes.includes(currentUser.username)) {
            pic.likes.push(currentUser.username);
            addNotification(model, `${currentUser.username} liked your post`);
          } else {
            pic.likes = pic.likes.filter(u => u !== currentUser.username);
            addNotification(model, `${currentUser.username} unliked your post`);
          }
          populateUserHome();
        });
        let commentInput = createInput('').parent(postDiv);
        createButton('Comment').parent(postDiv).class('button').mousePressed(() => {
          let comment = commentInput.value().trim();
          if (comment) {
            pic.comments.push({ user: currentUser.username, text: comment, replies: [], likes: [] });
            addNotification(model, `${currentUser.username} commented on your post`);
            commentInput.value('');
            populateUserHome();
          }
        });
        pic.comments.forEach((comment, index) => {
          let commentDiv = createDiv().parent(postDiv);
          createP(`${comment.user}: ${comment.text}`).parent(commentDiv);
          let likeCommentButton = createButton(`Like (${comment.likes.length})`).parent(commentDiv).class('button').mousePressed(() => {
            if (!comment.likes.includes(currentUser.username)) {
              comment.likes.push(currentUser.username);
              addNotification(users.find(u => u.username === comment.user), `${currentUser.username} liked your comment`);
            } else {
              comment.likes = comment.likes.filter(u => u !== currentUser.username);
            }
            populateUserHome();
          });
          let replyInput = createInput('').parent(commentDiv);
          createButton('Reply').parent(commentDiv).class('button').mousePressed(() => {
            let reply = replyInput.value().trim();
            if (reply) {
              comment.replies.push({ user: currentUser.username, text: reply });
              addNotification(users.find(u => u.username === comment.user), `${currentUser.username} replied to your comment`);
              replyInput.value('');
              populateUserHome();
            }
          });
          comment.replies.forEach(reply => {
            createP(`↳ ${reply.user}: ${reply.text}`).parent(commentDiv);
          });
        });
        createButton('Bookmark').parent(postDiv).class('button').mousePressed(() => {
          if (!currentUser.bookmarks.includes(pic.id)) {
            currentUser.bookmarks.push(pic.id);
            addNotification(currentUser, `Bookmarked ${model.username}'s post`);
          } else {
            currentUser.bookmarks = currentUser.bookmarks.filter(id => id !== pic.id);
            addNotification(currentUser, `Unbookmarked ${model.username}'s post`);
          }
          populateUserHome();
        });
      });
    }
  });
  let notifications = select('#notifications');
  notifications.html('');
  createElement('h3', 'Notifications').parent(notifications);
  currentUser.notifications.slice(-5).forEach(note => {
    createP(note).parent(notifications).class('notification');
  });
}

function populateModelPictures(model) {
  select('#picturesTitle').html(`${model.username}'s Pictures`);
  let gallery = select('#gallery');
  gallery.html('');
  if (model.pictures && model.pictures.length > 0) {
    let start = (currentPage - 1) * picturesPerPage;
    let end = start + picturesPerPage;
    let paginatedPictures = model.pictures.slice(start, end);
    paginatedPictures.forEach(pic => {
      let pg = createFootPicture(pic);
      gallery.child(pg.elt);
    });
    updatePagination(model.pictures.length);
  } else {
    createP('No pictures available').parent(gallery);
  }
}

function updatePagination(totalPictures) {
  let totalPages = Math.ceil(totalPictures / picturesPerPage);
  let pagination = select('#pagination');
  pagination.html('');
  if (totalPages > 1) {
    createButton('Previous').parent(pagination).class('button').mousePressed(() => {
      if (currentPage > 1) {
        currentPage--;
        populateModelPictures(currentModel);
      }
    }).attribute('disabled', currentPage === 1 ? 'true' : null);
    createP(`Page ${currentPage} of ${totalPages}`).parent(pagination);
    createButton('Next').parent(pagination).class('button').mousePressed(() => {
      if (currentPage < totalPages) {
        currentPage++;
        populateModelPictures(currentModel);
      }
    }).attribute('disabled', currentPage === totalPages ? 'true' : null);
  }
}

function populateChat() {
  let chat = select('#chatMessages');
  chat.html('');
  createElement('h3', `Messages with ${currentModel ? currentModel.username : 'All'}`).parent(chat);
  currentUser.messages.filter(msg => !currentModel || msg.from === currentModel.username || msg.to === currentModel.username).forEach(msg => {
    createP(`${msg.from} to ${msg.to}: ${msg.text}`).parent(chat).class('chat-message');
  });
}

function sendMessage(input) {
  let text = input.value().trim();
  if (text && currentModel) {
    let message = { from: currentUser.username, to: currentModel.username, text, timestamp: Date.now() };
    currentUser.messages.push(message);
    users.find(u => u.username === currentModel.username).messages.push(message);
    addNotification(currentModel, `${currentUser.username} sent you a message`);
    input.value('');
    populateChat();
  }
}

function bulkMessage() {
  let text = prompt('Enter message to all subscribers:');
  if (text) {
    users.forEach(user => {
      if (user.subscriptions && user.subscriptions.includes(currentUser.username)) {
        let message = { from: currentUser.username, to: user.username, text, timestamp: Date.now() };
        user.messages.push(message);
        currentUser.messages.push(message);
        addNotification(user, `${currentUser.username} sent you a message`);
      }
    });
    uploadSuccessP.html('Message sent to all subscribers').show().class('success');
    setTimeout(() => uploadSuccessP.hide(), 2000);
  }
}

function sendAdminEmail(input, target) {
  let text = input.value().trim();
  if (text) {
    users.forEach(user => {
      if (target === 'all' || (target === 'creators' && user.role === 'creator')) {
        addNotification(user, `Admin Email: ${text}`);
      }
    });
    input.value('');
    alert(`Simulated email sent to ${target}`);
  }
}

function populateAdminPanel() {
  let usersDiv = select('#adminUsers');
  usersDiv.html('');
  createElement('h3', 'User Management').parent(usersDiv);
  users.forEach(user => {
    let userDiv = createDiv().parent(usersDiv).class('model-card');
    createP(`${user.username} (${user.role})`).parent(userDiv);
    createButton('Delete').parent(userDiv).class('button').mousePressed(() => {
      if (user.username !== currentUser.username) {
        users = users.filter(u => u.username !== user.username);
        populateAdminPanel();
        addNotification(currentUser, `Deleted user ${user.username}`);
      }
    });
  });
}

function addNotification(user, message) {
  user.notifications.push(`${new Date().toLocaleString()}: ${message}`);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
