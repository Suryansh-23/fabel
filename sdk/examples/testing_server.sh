BASE_URL="http://localhost:3000"


# Testing the api/conversation endpoint
# echo "=== Example 1: Multi-User Conversation with Image Generation Request ==="
# echo "Scenario: User-1 posts about SpaceX, User-2 requests image with @mentions, @fabel AI generates"
# curl -X POST "$BASE_URL/api/conversation" \
#   -H "Content-Type: application/json" \
#   -d '{
#     "messages": [
#       {
#         "role": "user",
#         "username": "User-1",
#         "content": [
#           {
#             "type": "text",
#             "text": "Successful launch of starships 11th ship to the space!"
#           }
#         ]
#       },
#       {
#         "role": "user",
#         "username": "User-2",
#         "content": [
#           {
#             "type": "text",
#             "text": "I am a @Base fellow, I wish I could see @Jesse_Pollak with @elon together celebrating this!"
#           }
#         ]
#       },
#       {
#         "role": "user",
#         "username": "fabel",
#         "content": [
#           {
#             "type": "text",
#             "text": "Generate the image for User-2 message!"
#           }
#         ]
#       }
#     ]
#   }'


# # Testing the api/conversation/concise endpoint of the server 
# echo -e "\n\n=== Example 8: Long Conversation with Concise Summary ==="
# echo "Scenario: Long discussion thread, using concise endpoint"
# curl -X POST "$BASE_URL/api/conversation/concise" \
#   -H "Content-Type: application/json" \
#   -d '{
#     "maxMessages": 3,
#     "messages": [
#       {
#         "role": "user",
#         "username": "alice",
#         "content": [{"type": "text", "text": "Starting a new project!"}]
#       },
#       {
#         "role": "user",
#         "username": "bob",
#         "content": [{"type": "text", "text": "What kind of project?"}]
#       },
#       {
#         "role": "user",
#         "username": "alice",
#         "content": [{"type": "text", "text": "A web3 gaming platform"}]
#       },
#       {
#         "role": "user",
#         "username": "charlie",
#         "content": [{"type": "text", "text": "Sounds awesome! Need any help?"}]
#       },
#       {
#         "role": "user",
#         "username": "alice",
#         "content": [{"type": "text", "text": "Yes! We need concept art"}]
#       },
#       {
#         "role": "user",
#         "username": "art_bot",
#         "content": [{"type": "text", "text": "Generate futuristic gaming concept art for a web3 platform"}]
#       }
#     ]
#   }'



echo -e "\n\n=== Example 2: Multi-User Thread with Image References ==="
echo "Scenario: Multiple users discussing a design with image attachments"
curl -X POST "$BASE_URL/api/conversation" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "username": "designer_mike",
        "content": [
          {
            "type": "text",
            "text": "Check out this new location that i visited "
          },
          {
            "type": "image",
            "imageUrl": "https://images.unsplash.com/photo-1591154669695-5f2a8d20c089?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1287"
          }
        ]
      },
      {
        "role": "user",
        "username": "product_sarah",
        "content": [
          {
            "type": "text",
            "text": "Love it! Can we have some celebrety with it?"
          }
        ]
      },
      {
        "role": "user",
        "username": "ai_assistant",
        "content": [
          {
            "type": "text",
            "text": "Create an image with Elon Musk in the place in the image"
          }
        ]
      }
    ]
  }'

# echo -e "\n\n=== Example 3: Video Generation Request in Team Chat ==="
# echo "Scenario: Team discussing product demo video"
# curl -X POST "$BASE_URL/api/conversation" \
#   -H "Content-Type: application/json" \
#   -d '{
#     "messages": [
#       {
#         "role": "user",
#         "username": "marketing_alex",
#         "content": [
#           {
#             "type": "text",
#             "text": "We need a product demo video for the launch next week"
#           }
#         ]
#       },
#       {
#         "role": "user",
#         "username": "ceo_jane",
#         "content": [
#           {
#             "type": "text",
#             "text": "Great idea! Should be around 60 seconds, highlighting our 3 key features"
#           }
#         ]
#       },
#       {
#         "role": "user",
#         "username": "video_bot",
#         "content": [
#           {
#             "type": "text",
#             "text": "Generate a 60-second video animation showcasing our top 3 features with smooth transitions"
#           }
#         ]
#       }
#     ]
#   }'

# echo -e "\n\n=== Example 4: Social Media Style - NFT Community ==="
# echo "Scenario: NFT community members requesting artwork"
# curl -X POST "$BASE_URL/api/conversation" \
#   -H "Content-Type: application/json" \
#   -d '{
#     "messages": [
#       {
#         "role": "user",
#         "username": "crypto_whale",
#         "content": [
#           {
#             "type": "text",
#             "text": "Just minted 100 new NFTs on @base! 🚀"
#           }
#         ]
#       },
#       {
#         "role": "user",
#         "username": "artist_bob",
#         "content": [
#           {
#             "type": "text",
#             "text": "Congrats! Would love to see a cyberpunk version of your collection art"
#           }
#         ]
#       },
#       {
#         "role": "user",
#         "username": "art_ai",
#         "content": [
#           {
#             "type": "text",
#             "text": "Generate a cyberpunk-style NFT artwork with neon colors and futuristic city background"
#           }
#         ]
#       }
#     ]
#   }'

# echo -e "\n\n=== Example 5: Mixed Media Request - Event Promotion ==="
# echo "Scenario: Planning event promotion materials"
# curl -X POST "$BASE_URL/api/conversation" \
#   -H "Content-Type: application/json" \
#   -d '{
#     "messages": [
#       {
#         "role": "user",
#         "username": "events_team",
#         "content": [
#           {
#             "type": "text",
#             "text": "Our conference is in 2 weeks! Need promotion materials"
#           }
#         ]
#       },
#       {
#         "role": "user",
#         "username": "social_media_mgr",
#         "content": [
#           {
#             "type": "text",
#             "text": "Lets do both static images for Instagram and a teaser video for Twitter"
#           }
#         ]
#       },
#       {
#         "role": "user",
#         "username": "content_ai",
#         "content": [
#           {
#             "type": "text",
#             "text": "Create promotional images and a 15-second teaser video for our tech conference"
#           }
#         ]
#       }
#     ]
#   }'

# echo -e "\n\n=== Example 6: Simple Text Conversation ==="
# echo "Scenario: Users discussing without media generation needs"
# curl -X POST "$BASE_URL/api/conversation" \
#   -H "Content-Type: application/json" \
#   -d '{
#     "messages": [
#       {
#         "role": "user",
#         "username": "dev_john",
#         "content": [
#           {
#             "type": "text",
#             "text": "Anyone know how to fix CORS errors in Express?"
#           }
#         ]
#       },
#       {
#         "role": "user",
#         "username": "senior_dev",
#         "content": [
#           {
#             "type": "text",
#             "text": "You need to install and configure the cors middleware"
#           }
#         ]
#       },
#       {
#         "role": "user",
#         "username": "dev_john",
#         "content": [
#           {
#             "type": "text",
#             "text": "Can you explain how to set it up?"
#           }
#         ]
#       }
#     ]
#   }'

# echo -e "\n\n=== Example 7: Base64 Image in Message ==="
# echo "Scenario: User sharing base64 encoded image"
# curl -X POST "$BASE_URL/api/conversation" \
#   -H "Content-Type: application/json" \
#   -d '{
#     "messages": [
#       {
#         "role": "user",
#         "username": "photographer",
#         "content": [
#           {
#             "type": "text",
#             "text": "Here is my sunset photo from yesterday"
#           },
#           {
#             "type": "image",
#             "imageData": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
#           }
#         ]
#       },
#       {
#         "role": "user",
#         "username": "photo_editor",
#         "content": [
#           {
#             "type": "text",
#             "text": "Beautiful! Can you enhance the colors and make it more vibrant?"
#           }
#         ]
#       },
#       {
#         "role": "user",
#         "username": "image_ai",
#         "content": [
#           {
#             "type": "text",
#             "text": "Generate an enhanced version of the sunset photo with vibrant, saturated colors"
#           }
#         ]
#       }
#     ]
#   }'

# echo -e "\n\n=== Done! ===\"
