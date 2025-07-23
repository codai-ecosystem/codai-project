// Hub Service - Comprehensive Collaboration and Social Hub Testing
// Testing all social features, collaboration tools, team management, and communication flows

import { test, expect, Page } from '@playwright/test';

const HUB_BASE_URL = 'http://localhost:4003';

test.describe('🌐 Hub Service - Comprehensive Collaboration Testing', () => {

  test.describe('👥 Team Collaboration Center', () => {

    test('Teams Overview and Management', async ({ page }) => {
      await page.goto(`${HUB_BASE_URL}/teams`);

      // Test teams grid/list
      const teamsContainer = page.locator('.teams-grid, .teams-list, [data-testid="teams"]');
      if (await teamsContainer.count() > 0) {
        await expect(teamsContainer).toBeVisible();

        // Test team cards
        const teamCards = teamsContainer.locator('.team-card, .team-item');
        if (await teamCards.count() > 0) {
          const firstTeam = teamCards.first();
          await expect(firstTeam).toBeVisible();

          // Test team info display
          const teamName = firstTeam.locator('.team-name, h3, .title');
          const memberCount = firstTeam.locator('.member-count, .members');
          const teamStatus = firstTeam.locator('.team-status, .status');

          if (await teamName.count() > 0) await expect(teamName).toBeVisible();
          if (await memberCount.count() > 0) await expect(memberCount).toBeVisible();
          if (await teamStatus.count() > 0) await expect(teamStatus).toBeVisible();

          // Test team actions
          const joinButton = firstTeam.locator('button:has-text("Join"), [data-action="join"]');
          const viewButton = firstTeam.locator('button:has-text("View"), [data-action="view"]');

          if (await joinButton.count() > 0) await expect(joinButton).toBeVisible();
          if (await viewButton.count() > 0) {
            await viewButton.click();
            await page.waitForLoadState('networkidle');
          }
        }
      }
    });

    test('Team Creation Workflow', async ({ page }) => {
      await page.goto(`${HUB_BASE_URL}/teams`);

      const createTeamButton = page.locator('button:has-text("Create Team"), [data-action="create-team"]');
      if (await createTeamButton.count() > 0) {
        await createTeamButton.click();

        const createTeamModal = page.locator('.create-team-modal, [data-testid="create-team-modal"]');
        if (await createTeamModal.count() > 0) {
          await expect(createTeamModal).toBeVisible();

          // Test team creation form
          const teamData = {
            name: 'Test Development Team',
            description: 'A comprehensive testing team for CODAI development',
            visibility: 'public',
            category: 'development'
          };

          for (const [field, value] of Object.entries(teamData)) {
            const input = createTeamModal.locator(`input[name="${field}"], textarea[name="${field}"], select[name="${field}"]`);
            if (await input.count() > 0) {
              if (field === 'visibility' || field === 'category') {
                await input.selectOption(value);
              } else {
                await input.fill(value);
              }
            }
          }

          // Test team avatar upload
          const avatarUpload = createTeamModal.locator('input[type="file"], .avatar-upload');
          if (await avatarUpload.count() > 0) {
            await expect(avatarUpload).toBeVisible();
          }

          // Test team creation
          const createButton = createTeamModal.locator('button:has-text("Create"), button[type="submit"]');
          if (await createButton.count() > 0) {
            await createButton.click();
            await page.waitForLoadState('networkidle');

            // Verify team created and navigate to team page
            await expect(page.locator(':has-text("Test Development Team")')).toBeVisible();
          }
        }
      }
    });

    test('Team Member Management', async ({ page }) => {
      await page.goto(`${HUB_BASE_URL}/teams/test-team`);

      const teamPage = page.locator('.team-page, [data-testid="team-page"]');
      if (await teamPage.count() > 0) {
        await expect(teamPage).toBeVisible();

        // Test members section
        const membersSection = teamPage.locator('.members-section, [data-testid="members"]');
        if (await membersSection.count() > 0) {
          await expect(membersSection).toBeVisible();

          // Test invite members
          const inviteButton = membersSection.locator('button:has-text("Invite"), [data-action="invite"]');
          if (await inviteButton.count() > 0) {
            await inviteButton.click();

            const inviteModal = page.locator('.invite-modal, [data-testid="invite-modal"]');
            if (await inviteModal.count() > 0) {
              await expect(inviteModal).toBeVisible();

              const emailInput = inviteModal.locator('input[type="email"], input[name="email"]');
              if (await emailInput.count() > 0) {
                await emailInput.fill('newmember@codai.test');

                const roleSelect = inviteModal.locator('select[name="role"]');
                if (await roleSelect.count() > 0) {
                  await roleSelect.selectOption('member');
                }

                const sendInviteButton = inviteModal.locator('button:has-text("Send Invite")');
                if (await sendInviteButton.count() > 0) {
                  await sendInviteButton.click();
                  await page.waitForLoadState('networkidle');
                }
              }
            }
          }

          // Test member list
          const memberList = membersSection.locator('.member-list, [data-testid="member-list"]');
          if (await memberList.count() > 0) {
            const memberItems = memberList.locator('.member-item, [data-testid="member-item"]');
            if (await memberItems.count() > 0) {
              const firstMember = memberItems.first();

              // Test member info
              const memberAvatar = firstMember.locator('.avatar, .member-avatar');
              const memberName = firstMember.locator('.member-name, .name');
              const memberRole = firstMember.locator('.member-role, .role');

              if (await memberAvatar.count() > 0) await expect(memberAvatar).toBeVisible();
              if (await memberName.count() > 0) await expect(memberName).toBeVisible();
              if (await memberRole.count() > 0) await expect(memberRole).toBeVisible();

              // Test member actions
              const memberActions = firstMember.locator('.member-actions, [data-testid="member-actions"]');
              if (await memberActions.count() > 0) {
                const promoteButton = memberActions.locator('button:has-text("Promote")');
                const removeButton = memberActions.locator('button:has-text("Remove")');

                if (await promoteButton.count() > 0) await expect(promoteButton).toBeVisible();
                if (await removeButton.count() > 0) await expect(removeButton).toBeVisible();
              }
            }
          }
        }
      }
    });

    test('Team Channels and Communication', async ({ page }) => {
      await page.goto(`${HUB_BASE_URL}/teams/test-team/channels`);

      const channelsPage = page.locator('.channels-page, [data-testid="channels"]');
      if (await channelsPage.count() > 0) {
        await expect(channelsPage).toBeVisible();

        // Test channels sidebar
        const channelsSidebar = page.locator('.channels-sidebar, [data-testid="channels-sidebar"]');
        if (await channelsSidebar.count() > 0) {
          const channelList = channelsSidebar.locator('.channel-list, [data-testid="channel-list"]');
          if (await channelList.count() > 0) {
            const channels = channelList.locator('.channel-item, [data-testid="channel-item"]');
            if (await channels.count() > 0) {
              await channels.first().click();
              await page.waitForLoadState('networkidle');
            }
          }

          // Test create channel
          const createChannelButton = channelsSidebar.locator('button:has-text("Create Channel"), [data-action="create-channel"]');
          if (await createChannelButton.count() > 0) {
            await createChannelButton.click();

            const channelForm = page.locator('.channel-form, [data-testid="channel-form"]');
            if (await channelForm.count() > 0) {
              await channelForm.locator('input[name="name"]').fill('general-discussion');
              await channelForm.locator('textarea[name="description"]').fill('General team discussions');
              await channelForm.locator('select[name="type"]').selectOption('public');

              const createButton = channelForm.locator('button:has-text("Create")');
              if (await createButton.count() > 0) {
                await createButton.click();
                await page.waitForLoadState('networkidle');
              }
            }
          }
        }

        // Test main chat area
        const chatArea = page.locator('.chat-area, [data-testid="chat-area"]');
        if (await chatArea.count() > 0) {
          await expect(chatArea).toBeVisible();

          // Test message history
          const messageHistory = chatArea.locator('.message-history, [data-testid="messages"]');
          if (await messageHistory.count() > 0) {
            const messages = messageHistory.locator('.message, [data-testid="message"]');
            if (await messages.count() > 0) {
              await expect(messages.first()).toBeVisible();
            }
          }

          // Test message input
          const messageInput = chatArea.locator('.message-input, [data-testid="message-input"]');
          if (await messageInput.count() > 0) {
            await messageInput.fill('Hello team! This is a test message.');
            await page.keyboard.press('Enter');
            await page.waitForLoadState('networkidle');
          }

          // Test file upload
          const fileUpload = chatArea.locator('input[type="file"], .file-upload');
          if (await fileUpload.count() > 0) {
            await expect(fileUpload).toBeVisible();
          }

          // Test emoji picker
          const emojiButton = chatArea.locator('.emoji-button, [data-action="emoji"]');
          if (await emojiButton.count() > 0) {
            await emojiButton.click();

            const emojiPicker = page.locator('.emoji-picker, [data-testid="emoji-picker"]');
            if (await emojiPicker.count() > 0) {
              await expect(emojiPicker).toBeVisible();

              const emoji = emojiPicker.locator('.emoji').first();
              if (await emoji.count() > 0) {
                await emoji.click();
              }
            }
          }
        }
      }
    });
  });

  test.describe('🔄 Project Collaboration Workflows', () => {

    test('Collaborative Project Dashboard', async ({ page }) => {
      await page.goto(`${HUB_BASE_URL}/projects/collaborative`);

      const projectDashboard = page.locator('.project-dashboard, [data-testid="project-dashboard"]');
      if (await projectDashboard.count() > 0) {
        await expect(projectDashboard).toBeVisible();

        // Test project overview section
        const projectOverview = projectDashboard.locator('.project-overview, [data-testid="project-overview"]');
        if (await projectOverview.count() > 0) {
          await expect(projectOverview).toBeVisible();

          const projectProgress = projectOverview.locator('.progress-bar, .progress');
          const projectStats = projectOverview.locator('.project-stats, [data-testid="stats"]');

          if (await projectProgress.count() > 0) await expect(projectProgress).toBeVisible();
          if (await projectStats.count() > 0) await expect(projectStats).toBeVisible();
        }

        // Test collaborative features
        const collaborativeFeatures = [
          '.shared-workspace, [data-testid="shared-workspace"]',
          '.real-time-editing, [data-testid="real-time-editing"]',
          '.collaborative-canvas, [data-testid="collaborative-canvas"]'
        ];

        for (const featureSelector of collaborativeFeatures) {
          const feature = projectDashboard.locator(featureSelector);
          if (await feature.count() > 0) {
            await expect(feature).toBeVisible();
          }
        }
      }
    });

    test('Real-time Code Collaboration', async ({ page }) => {
      await page.goto(`${HUB_BASE_URL}/projects/code-collaboration`);

      const codeCollaboration = page.locator('.code-collaboration, [data-testid="code-collaboration"]');
      if (await codeCollaboration.count() > 0) {
        await expect(codeCollaboration).toBeVisible();

        // Test collaborative code editor
        const codeEditor = codeCollaboration.locator('.collaborative-editor, [data-testid="code-editor"]');
        if (await codeEditor.count() > 0) {
          await expect(codeEditor).toBeVisible();

          // Test editor features
          const editorFeatures = [
            '.cursor-tracking, [data-testid="cursors"]',
            '.selection-sharing, [data-testid="selections"]',
            '.live-changes, [data-testid="live-changes"]'
          ];

          for (const featureSelector of editorFeatures) {
            const feature = codeEditor.locator(featureSelector);
            if (await feature.count() > 0) {
              await expect(feature).toBeVisible();
            }
          }
        }

        // Test collaboration sidebar
        const collaborationSidebar = codeCollaboration.locator('.collaboration-sidebar, [data-testid="collaboration-sidebar"]');
        if (await collaborationSidebar.count() > 0) {
          await expect(collaborationSidebar).toBeVisible();

          // Test active collaborators
          const activeCollaborators = collaborationSidebar.locator('.active-collaborators, [data-testid="active-collaborators"]');
          if (await activeCollaborators.count() > 0) {
            const collaborators = activeCollaborators.locator('.collaborator, [data-testid="collaborator"]');
            if (await collaborators.count() > 0) {
              await expect(collaborators.first()).toBeVisible();
            }
          }

          // Test code comments
          const codeComments = collaborationSidebar.locator('.code-comments, [data-testid="code-comments"]');
          if (await codeComments.count() > 0) {
            await expect(codeComments).toBeVisible();

            const addCommentButton = codeComments.locator('button:has-text("Add Comment")');
            if (await addCommentButton.count() > 0) {
              await addCommentButton.click();

              const commentForm = page.locator('.comment-form, [data-testid="comment-form"]');
              if (await commentForm.count() > 0) {
                await commentForm.locator('textarea').fill('This section needs optimization');
                await commentForm.locator('button:has-text("Post")').click();
                await page.waitForLoadState('networkidle');
              }
            }
          }
        }
      }
    });

    test('Shared Whiteboard and Brainstorming', async ({ page }) => {
      await page.goto(`${HUB_BASE_URL}/whiteboard`);

      const whiteboard = page.locator('.whiteboard, [data-testid="whiteboard"]');
      if (await whiteboard.count() > 0) {
        await expect(whiteboard).toBeVisible();

        // Test whiteboard canvas
        const canvas = whiteboard.locator('canvas, .drawing-canvas');
        if (await canvas.count() > 0) {
          await expect(canvas).toBeVisible();

          // Test drawing tools
          const drawingTools = whiteboard.locator('.drawing-tools, [data-testid="drawing-tools"]');
          if (await drawingTools.count() > 0) {
            const tools = ['pen', 'eraser', 'text', 'shapes', 'sticky-notes'];

            for (const tool of tools) {
              const toolButton = drawingTools.locator(`[data-tool="${tool}"], button:has-text("${tool}")`);
              if (await toolButton.count() > 0) {
                await toolButton.click();
                await page.waitForTimeout(500);
              }
            }
          }

          // Test collaborative features
          const collaborativeFeatures = whiteboard.locator('.collaborative-features, [data-testid="collaborative-features"]');
          if (await collaborativeFeatures.count() > 0) {
            const livePointers = collaborativeFeatures.locator('.live-pointers, [data-testid="live-pointers"]');
            const sharedSelection = collaborativeFeatures.locator('.shared-selection, [data-testid="shared-selection"]');

            if (await livePointers.count() > 0) await expect(livePointers).toBeVisible();
            if (await sharedSelection.count() > 0) await expect(sharedSelection).toBeVisible();
          }
        }

        // Test whiteboard templates
        const templatesPanel = whiteboard.locator('.templates-panel, [data-testid="templates"]');
        if (await templatesPanel.count() > 0) {
          const templateButton = templatesPanel.locator('.template-item, [data-testid="template"]').first();
          if (await templateButton.count() > 0) {
            await templateButton.click();
            await page.waitForLoadState('networkidle');
          }
        }
      }
    });
  });

  test.describe('📱 Social Features and Networking', () => {

    test('User Profiles and Social Connections', async ({ page }) => {
      await page.goto(`${HUB_BASE_URL}/profiles`);

      const profilesPage = page.locator('.profiles-page, [data-testid="profiles"]');
      if (await profilesPage.count() > 0) {
        await expect(profilesPage).toBeVisible();

        // Test user profile cards
        const userProfiles = profilesPage.locator('.user-profile, [data-testid="user-profile"]');
        if (await userProfiles.count() > 0) {
          const firstProfile = userProfiles.first();
          await expect(firstProfile).toBeVisible();

          // Test profile elements
          const profileAvatar = firstProfile.locator('.profile-avatar, .avatar');
          const profileName = firstProfile.locator('.profile-name, .name');
          const profileTitle = firstProfile.locator('.profile-title, .title');
          const skillsTags = firstProfile.locator('.skills, .tags');

          if (await profileAvatar.count() > 0) await expect(profileAvatar).toBeVisible();
          if (await profileName.count() > 0) await expect(profileName).toBeVisible();
          if (await profileTitle.count() > 0) await expect(profileTitle).toBeVisible();
          if (await skillsTags.count() > 0) await expect(skillsTags).toBeVisible();

          // Test social actions
          const connectButton = firstProfile.locator('button:has-text("Connect"), [data-action="connect"]');
          const messageButton = firstProfile.locator('button:has-text("Message"), [data-action="message"]');

          if (await connectButton.count() > 0) {
            await connectButton.click();
            await page.waitForLoadState('networkidle');
          }
          if (await messageButton.count() > 0) {
            await expect(messageButton).toBeVisible();
          }
        }

        // Test profile filters
        const profileFilters = profilesPage.locator('.profile-filters, [data-testid="filters"]');
        if (await profileFilters.count() > 0) {
          const skillFilter = profileFilters.locator('select[name="skills"], .skill-filter');
          const locationFilter = profileFilters.locator('select[name="location"], .location-filter');

          if (await skillFilter.count() > 0) {
            await skillFilter.selectOption('javascript');
            await page.waitForLoadState('networkidle');
          }
          if (await locationFilter.count() > 0) {
            await locationFilter.selectOption('remote');
            await page.waitForLoadState('networkidle');
          }
        }
      }
    });

    test('Community Forums and Discussions', async ({ page }) => {
      await page.goto(`${HUB_BASE_URL}/forums`);

      const forumsPage = page.locator('.forums-page, [data-testid="forums"]');
      if (await forumsPage.count() > 0) {
        await expect(forumsPage).toBeVisible();

        // Test forum categories
        const forumCategories = forumsPage.locator('.forum-categories, [data-testid="categories"]');
        if (await forumCategories.count() > 0) {
          const categories = forumCategories.locator('.category, [data-testid="category"]');
          if (await categories.count() > 0) {
            const firstCategory = categories.first();
            await firstCategory.click();
            await page.waitForLoadState('networkidle');
          }
        }

        // Test discussion threads
        const discussionThreads = forumsPage.locator('.discussion-threads, [data-testid="threads"]');
        if (await discussionThreads.count() > 0) {
          const threads = discussionThreads.locator('.thread, [data-testid="thread"]');
          if (await threads.count() > 0) {
            const firstThread = threads.first();

            // Test thread preview
            const threadTitle = firstThread.locator('.thread-title, .title');
            const threadAuthor = firstThread.locator('.thread-author, .author');
            const threadStats = firstThread.locator('.thread-stats, .stats');

            if (await threadTitle.count() > 0) await expect(threadTitle).toBeVisible();
            if (await threadAuthor.count() > 0) await expect(threadAuthor).toBeVisible();
            if (await threadStats.count() > 0) await expect(threadStats).toBeVisible();

            // Click to view full thread
            await firstThread.click();
            await page.waitForLoadState('networkidle');

            // Test thread page
            const threadPage = page.locator('.thread-page, [data-testid="thread-page"]');
            if (await threadPage.count() > 0) {
              await expect(threadPage).toBeVisible();

              // Test replies
              const replies = threadPage.locator('.reply, [data-testid="reply"]');
              if (await replies.count() > 0) {
                await expect(replies.first()).toBeVisible();
              }

              // Test reply form
              const replyForm = threadPage.locator('.reply-form, [data-testid="reply-form"]');
              if (await replyForm.count() > 0) {
                await replyForm.locator('textarea').fill('This is a great discussion point!');
                await replyForm.locator('button:has-text("Reply")').click();
                await page.waitForLoadState('networkidle');
              }
            }
          }
        }

        // Test create new thread
        const createThreadButton = forumsPage.locator('button:has-text("New Thread"), [data-action="create-thread"]');
        if (await createThreadButton.count() > 0) {
          await createThreadButton.click();

          const threadForm = page.locator('.thread-form, [data-testid="thread-form"]');
          if (await threadForm.count() > 0) {
            await threadForm.locator('input[name="title"]').fill('Testing Hub Forum Features');
            await threadForm.locator('textarea[name="content"]').fill('Testing the comprehensive forum functionality in CODAI Hub.');
            await threadForm.locator('select[name="category"]').selectOption('general');

            const postButton = threadForm.locator('button:has-text("Post Thread")');
            if (await postButton.count() > 0) {
              await postButton.click();
              await page.waitForLoadState('networkidle');
            }
          }
        }
      }
    });

    test('Events and Meetups Management', async ({ page }) => {
      await page.goto(`${HUB_BASE_URL}/events`);

      const eventsPage = page.locator('.events-page, [data-testid="events"]');
      if (await eventsPage.count() > 0) {
        await expect(eventsPage).toBeVisible();

        // Test events calendar
        const eventsCalendar = eventsPage.locator('.events-calendar, [data-testid="calendar"]');
        if (await eventsCalendar.count() > 0) {
          await expect(eventsCalendar).toBeVisible();

          // Test calendar navigation
          const calendarNav = eventsCalendar.locator('.calendar-nav, [data-testid="calendar-nav"]');
          if (await calendarNav.count() > 0) {
            const nextButton = calendarNav.locator('button:has-text("Next"), [data-action="next"]');
            const prevButton = calendarNav.locator('button:has-text("Previous"), [data-action="prev"]');

            if (await nextButton.count() > 0) {
              await nextButton.click();
              await page.waitForTimeout(500);
            }
            if (await prevButton.count() > 0) {
              await prevButton.click();
              await page.waitForTimeout(500);
            }
          }

          // Test event items on calendar
          const eventItems = eventsCalendar.locator('.event-item, [data-testid="event-item"]');
          if (await eventItems.count() > 0) {
            await eventItems.first().click();
            await page.waitForLoadState('networkidle');

            // Test event details modal
            const eventModal = page.locator('.event-modal, [data-testid="event-modal"]');
            if (await eventModal.count() > 0) {
              await expect(eventModal).toBeVisible();

              const rsvpButton = eventModal.locator('button:has-text("RSVP"), [data-action="rsvp"]');
              if (await rsvpButton.count() > 0) {
                await rsvpButton.click();
                await page.waitForLoadState('networkidle');
              }
            }
          }
        }

        // Test create event
        const createEventButton = eventsPage.locator('button:has-text("Create Event"), [data-action="create-event"]');
        if (await createEventButton.count() > 0) {
          await createEventButton.click();

          const eventForm = page.locator('.event-form, [data-testid="event-form"]');
          if (await eventForm.count() > 0) {
            await expect(eventForm).toBeVisible();

            const eventData = {
              title: 'CODAI Development Meetup',
              description: 'Monthly meetup for CODAI developers',
              date: '2024-12-31',
              time: '18:00',
              location: 'Virtual Meeting Room',
              maxAttendees: '50'
            };

            for (const [field, value] of Object.entries(eventData)) {
              const input = eventForm.locator(`input[name="${field}"], textarea[name="${field}"]`);
              if (await input.count() > 0) {
                await input.fill(value);
              }
            }

            const createButton = eventForm.locator('button:has-text("Create Event")');
            if (await createButton.count() > 0) {
              await createButton.click();
              await page.waitForLoadState('networkidle');
            }
          }
        }
      }
    });
  });

  test.describe('🔔 Notifications and Activity Feeds', () => {

    test('Real-time Notifications System', async ({ page }) => {
      await page.goto(`${HUB_BASE_URL}/notifications`);

      const notificationsPage = page.locator('.notifications-page, [data-testid="notifications"]');
      if (await notificationsPage.count() > 0) {
        await expect(notificationsPage).toBeVisible();

        // Test notification filters
        const notificationFilters = notificationsPage.locator('.notification-filters, [data-testid="filters"]');
        if (await notificationFilters.count() > 0) {
          const filterOptions = ['all', 'mentions', 'follows', 'team-updates', 'system'];

          for (const filter of filterOptions) {
            const filterButton = notificationFilters.locator(`button:has-text("${filter}"), [data-filter="${filter}"]`);
            if (await filterButton.count() > 0) {
              await filterButton.click();
              await page.waitForLoadState('networkidle');
            }
          }
        }

        // Test notification list
        const notificationList = notificationsPage.locator('.notification-list, [data-testid="notification-list"]');
        if (await notificationList.count() > 0) {
          const notifications = notificationList.locator('.notification, [data-testid="notification"]');
          if (await notifications.count() > 0) {
            const firstNotification = notifications.first();

            // Test notification content
            const notificationIcon = firstNotification.locator('.notification-icon, .icon');
            const notificationText = firstNotification.locator('.notification-text, .text');
            const notificationTime = firstNotification.locator('.notification-time, .time');

            if (await notificationIcon.count() > 0) await expect(notificationIcon).toBeVisible();
            if (await notificationText.count() > 0) await expect(notificationText).toBeVisible();
            if (await notificationTime.count() > 0) await expect(notificationTime).toBeVisible();

            // Test notification actions
            const markReadButton = firstNotification.locator('button:has-text("Mark Read"), [data-action="mark-read"]');
            const deleteButton = firstNotification.locator('button:has-text("Delete"), [data-action="delete"]');

            if (await markReadButton.count() > 0) {
              await markReadButton.click();
              await page.waitForLoadState('networkidle');
            }
            if (await deleteButton.count() > 0) {
              await expect(deleteButton).toBeVisible();
            }
          }
        }

        // Test notification settings
        const settingsButton = notificationsPage.locator('button:has-text("Settings"), [data-action="settings"]');
        if (await settingsButton.count() > 0) {
          await settingsButton.click();

          const settingsModal = page.locator('.notification-settings, [data-testid="notification-settings"]');
          if (await settingsModal.count() > 0) {
            await expect(settingsModal).toBeVisible();

            // Test notification preferences
            const emailNotifications = settingsModal.locator('input[name="email_notifications"]');
            const pushNotifications = settingsModal.locator('input[name="push_notifications"]');

            if (await emailNotifications.count() > 0) {
              await emailNotifications.click();
            }
            if (await pushNotifications.count() > 0) {
              await pushNotifications.click();
            }

            const saveSettingsButton = settingsModal.locator('button:has-text("Save")');
            if (await saveSettingsButton.count() > 0) {
              await saveSettingsButton.click();
              await page.waitForLoadState('networkidle');
            }
          }
        }
      }
    });

    test('Activity Feed and Social Timeline', async ({ page }) => {
      await page.goto(`${HUB_BASE_URL}/feed`);

      const activityFeed = page.locator('.activity-feed, [data-testid="activity-feed"]');
      if (await activityFeed.count() > 0) {
        await expect(activityFeed).toBeVisible();

        // Test feed filters
        const feedFilters = activityFeed.locator('.feed-filters, [data-testid="feed-filters"]');
        if (await feedFilters.count() > 0) {
          const filterTabs = ['all', 'following', 'teams', 'projects'];

          for (const tab of filterTabs) {
            const tabButton = feedFilters.locator(`button:has-text("${tab}"), [data-tab="${tab}"]`);
            if (await tabButton.count() > 0) {
              await tabButton.click();
              await page.waitForLoadState('networkidle');
            }
          }
        }

        // Test activity items
        const activityItems = activityFeed.locator('.activity-item, [data-testid="activity-item"]');
        if (await activityItems.count() > 0) {
          const firstActivity = activityItems.first();
          await expect(firstActivity).toBeVisible();

          // Test activity engagement
          const likeButton = firstActivity.locator('button:has-text("Like"), [data-action="like"]');
          const commentButton = firstActivity.locator('button:has-text("Comment"), [data-action="comment"]');
          const shareButton = firstActivity.locator('button:has-text("Share"), [data-action="share"]');

          if (await likeButton.count() > 0) {
            await likeButton.click();
            await page.waitForTimeout(500);
          }

          if (await commentButton.count() > 0) {
            await commentButton.click();

            const commentForm = page.locator('.comment-form, [data-testid="comment-form"]');
            if (await commentForm.count() > 0) {
              await commentForm.locator('textarea').fill('Great update!');
              await commentForm.locator('button:has-text("Post")').click();
              await page.waitForLoadState('networkidle');
            }
          }
        }

        // Test create new post
        const createPostButton = activityFeed.locator('button:has-text("Create Post"), [data-action="create-post"]');
        if (await createPostButton.count() > 0) {
          await createPostButton.click();

          const postForm = page.locator('.post-form, [data-testid="post-form"]');
          if (await postForm.count() > 0) {
            await postForm.locator('textarea').fill('Testing the Hub activity feed functionality!');

            const postButton = postForm.locator('button:has-text("Post")');
            if (await postButton.count() > 0) {
              await postButton.click();
              await page.waitForLoadState('networkidle');
            }
          }
        }
      }
    });
  });

  test.describe('🔍 Search and Discovery', () => {

    test('Comprehensive Search Functionality', async ({ page }) => {
      await page.goto(`${HUB_BASE_URL}/search`);

      const searchPage = page.locator('.search-page, [data-testid="search-page"]');
      if (await searchPage.count() > 0) {
        await expect(searchPage).toBeVisible();

        // Test search input
        const searchInput = searchPage.locator('input[type="search"], .search-input');
        if (await searchInput.count() > 0) {
          await searchInput.fill('javascript development');
          await page.keyboard.press('Enter');
          await page.waitForLoadState('networkidle');

          // Test search filters
          const searchFilters = searchPage.locator('.search-filters, [data-testid="search-filters"]');
          if (await searchFilters.count() > 0) {
            const filterTypes = ['people', 'teams', 'projects', 'discussions', 'events'];

            for (const filterType of filterTypes) {
              const filterCheckbox = searchFilters.locator(`input[value="${filterType}"], [data-filter="${filterType}"]`);
              if (await filterCheckbox.count() > 0) {
                await filterCheckbox.click();
                await page.waitForLoadState('networkidle');
              }
            }
          }

          // Test search results
          const searchResults = searchPage.locator('.search-results, [data-testid="search-results"]');
          if (await searchResults.count() > 0) {
            await expect(searchResults).toBeVisible();

            const resultItems = searchResults.locator('.result-item, [data-testid="result-item"]');
            if (await resultItems.count() > 0) {
              await expect(resultItems.first()).toBeVisible();

              // Test result interaction
              await resultItems.first().click();
              await page.waitForLoadState('networkidle');
            }
          }
        }
      }
    });

    test('Discovery and Recommendations', async ({ page }) => {
      await page.goto(`${HUB_BASE_URL}/discover`);

      const discoveryPage = page.locator('.discovery-page, [data-testid="discovery"]');
      if (await discoveryPage.count() > 0) {
        await expect(discoveryPage).toBeVisible();

        // Test discovery sections
        const discoverySections = [
          '.recommended-people, [data-testid="recommended-people"]',
          '.trending-teams, [data-testid="trending-teams"]',
          '.popular-projects, [data-testid="popular-projects"]',
          '.upcoming-events, [data-testid="upcoming-events"]'
        ];

        for (const sectionSelector of discoverySections) {
          const section = discoveryPage.locator(sectionSelector);
          if (await section.count() > 0) {
            await expect(section).toBeVisible();

            const items = section.locator('.discovery-item, [data-testid="discovery-item"]');
            if (await items.count() > 0) {
              await expect(items.first()).toBeVisible();
            }
          }
        }

        // Test interest-based recommendations
        const interestFilters = discoveryPage.locator('.interest-filters, [data-testid="interest-filters"]');
        if (await interestFilters.count() > 0) {
          const interests = ['Web Development', 'AI/ML', 'Mobile Apps', 'DevOps', 'Design'];

          for (const interest of interests) {
            const interestTag = interestFilters.locator(`button:has-text("${interest}"), [data-interest="${interest.toLowerCase()}"]`);
            if (await interestTag.count() > 0) {
              await interestTag.click();
              await page.waitForLoadState('networkidle');
            }
          }
        }
      }
    });
  });
});

// Helper functions for Hub testing
export class HubTestHelpers {
  static async joinTeam(page: Page, teamName: string) {
    await page.goto(`${HUB_BASE_URL}/teams`);
    const teamCard = page.locator(`.team-card:has-text("${teamName}")`);
    if (await teamCard.count() > 0) {
      const joinButton = teamCard.locator('button:has-text("Join")');
      if (await joinButton.count() > 0) {
        await joinButton.click();
        await page.waitForLoadState('networkidle');
      }
    }
  }

  static async createChannel(page: Page, teamId: string, channelData: any) {
    await page.goto(`${HUB_BASE_URL}/teams/${teamId}/channels`);
    await page.click('button:has-text("Create Channel")');

    for (const [field, value] of Object.entries(channelData)) {
      const input = page.locator(`input[name="${field}"], textarea[name="${field}"], select[name="${field}"]`);
      if (await input.count() > 0) {
        if (field === 'type' || field === 'visibility') {
          await input.selectOption(value as string);
        } else {
          await input.fill(value as string);
        }
      }
    }

    await page.click('button:has-text("Create")');
    await page.waitForLoadState('networkidle');
  }

  static async postMessage(page: Page, message: string) {
    const messageInput = page.locator('.message-input, [data-testid="message-input"]');
    if (await messageInput.count() > 0) {
      await messageInput.fill(message);
      await page.keyboard.press('Enter');
      await page.waitForLoadState('networkidle');
    }
  }
}
