BASE_URL="http://localhost:3000"


# Testing the api/conversation endpoint ..... SUCCESS
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


# # Testing the api/conversation/concise endpoint of the server ........ SUCCESS 
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
#         "content": [{"type": "text", "text": "Yes! We need concept art, I would take insipiration from this https://cdn.dribbble.com/userupload/40309342/file/original-ac70a24d8b562377d52855a34bf7aa72.png?resize=400x0"}]
#       },
#       {
#         "role": "user",
#         "username": "art_bot",
#         "content": [{"type": "text", "text": "Take insipiration from the above image & generate the Platform design for FabelGames with Logo FG"}]
#       }
#     ]
#   }'


# Prompt with Image reference inside the prompt ...., COMPLETE 
# echo -e "\n\n=== Example 2: Multi-User Thread with Image References ==="
# echo "Scenario: Multiple users discussing a design with image attachments"
# curl -X POST "$BASE_URL/api/conversation" \
#   -H "Content-Type: application/json" \
#   -d '{
#     "messages": [
#       {
#         "role": "user",
#         "username": "designer_mike",
#         "content": [
#           {
#             "type": "text",
#             "text": "Check out this new location that i visited recently"
#           },
#           {
#             "type": "image",
#             "imageUrl": "https://travelchardham.com/sites/default/files/2024-12/Photos%20of%20Mussoorie%20Mall%20Road.jpg"
#           }
#         ]
#       },
#       {
#         "role": "user",
#         "username": "product_sarah",
#         "content": [
#           {
#             "type": "text",
#             "text": "Love it! Can we have some celebrety with it?"
#           }
#         ]
#       },
#       {
#         "role": "user",
#         "username": "ai_assistant",
#         "content": [
#           {
#             "type": "text",
#             "text": "I want A photorealistic image of Elon Musk standing in front of this sign."
#           }
#         ]
#       }
#     ]
#   }'

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
#             "text": "Generate a 10-second video animation showcasing our top 3 features with smooth transitions"
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

echo -e "\n\n=========================================="
echo "=== NEW V2 API EXAMPLES (InputContext/Output format) ==="
echo "=========================================="

# Example 1: Simple image generation with new format
# echo -e "\n\n=== V2 Example 1: Simple Image Generation Request ==="
# echo "Scenario: User requests image generation using new InputContext format"
# curl -X POST "$BASE_URL/api/v2/conversation" \
#   -H "Content-Type: application/json" \
#   -d '{
#     "context": [
#       {
#         "depth": 0,
#         "userMsg": {
#           "handle": "@user123",
#           "username": "John Doe",
#           "msg": "Generate a beautiful sunset over mountains"
#         }
#       }
#     ]
#   }'

# Example 2: Multi-depth conversation with image generation
echo -e "\n\n=== V2 Example 2: Multi-User Conversation Thread ==="
echo "Scenario: Multiple users in conversation, last one requests image"
curl -X POST "$BASE_URL/api/v2/conversation" \
  -H "Content-Type: application/json" \
  -d '{
    "context": [
      {
        "depth": 0,
        "userMsg": {
          "handle": "@alice",
          "username": "Alice",
          "msg": "I just visited SpaceX headquarters!"
        }
      },
      {
        "depth": 1,
        "userMsg": {
          "handle": "@bob",
          "username": "Bob",
          "msg": "Wow! That must have been amazing. Wish I could see Jesse pollak, here his image there with elon musk",
          "media": "https://fortune.com/img-assets/wp-content/uploads/2024/05/JessePollack-Base-044.jpg?w=1440&q=75"
        }
      },
      {
        "depth": 2,
        "userMsg": {
          "handle": "@fabel",
          "username": "Fabel AI",
          "msg": "Generate an image for the above need"
        }
      }
    ]
  }'

# Example 3: Conversation with image URL reference
# echo -e "\n\n=== V2 Example 3: Message with Image URL Media ==="
# echo "Scenario: User shares image URL and requests enhancement"
# curl -X POST "$BASE_URL/api/v2/conversation" \
#   -H "Content-Type: application/json" \
#   -d '{
#     "context": [
#       {
#         "depth": 0,
#         "userMsg": {
#           "handle": "@photographer",
#           "username": "Sarah Photo",
#           "msg": "Here is a photo of my recent visit to an hill station",
#           "media": "blob:https://gemini.google.com/37c93167-27d7-4f0c-b1d8-7945e9410cb2"
#         }
#       },
#       {
#         "depth": 1,
#         "userMsg": {
#           "handle": "@fabel",
#           "username": "AI agent",
#           "msg": "Generate an image of Jesse Pollak attached to Image ahead, in the before image of the place",
#           "media": "https://fortune.com/img-assets/wp-content/uploads/2024/05/JessePollack-Base-044.jpg?w=1440&q=75"
#         }
#       }
#     ]
#   }'

# Example 4: Video generation request
# echo -e "\n\n=== V2 Example 4: Video Generation Request ==="
# echo "Scenario: Team requesting video animation"
# curl -X POST "$BASE_URL/api/v2/conversation" \
#   -H "Content-Type: application/json" \
#   -d '{
#     "context": [
#       {
#         "depth": 0,
#         "userMsg": {
#           "handle": "@marketing",
#           "username": "Marketing Team",
#           "msg": "We need a promotional video for our new product launch"
#         }
#       },
#       {
#         "depth": 1,
#         "userMsg": {
#           "handle": "@ceo",
#           "username": "Jane CEO",
#           "msg": "Make a sample video before that, using the prompt below"
#         }
#       },
#       {
#         "depth": 2,
#         "userMsg": {
#           "handle": "@video_ai",
#           "username": "Video Bot",
#           "msg": "The scene is a rain-slicked, crumbling street in a forgotten city, shrouded in perpetual twilight. Giant, bioluminescent mushrooms have sprouted from the cracked asphalt, casting an eerie, pulsating green and purple glow onto the decaying facades of skeletal skyscrapers. A gentle, constant rain creates shimmering reflections in the puddles below, and the only sounds are the soft patter of rain and a low, otherworldly hum from the glowing fungi"
#         }
#       }
#     ]
#   }'

# # Example 5: NFT/Web3 community interaction
# echo -e "\n\n=== V2 Example 5: NFT Community Artwork Request ==="
# echo "Scenario: Web3 community discussing NFT art"
# curl -X POST "$BASE_URL/api/v2/conversation" \
#   -H "Content-Type: application/json" \
#   -d '{
#     "context": [
#       {
#         "depth": 0,
#         "userMsg": {
#           "handle": "@crypto_whale",
#           "username": "Crypto Whale",
#           "msg": "Just minted 100 NFTs on Base! 🚀"
#         }
#       },
#       {
#         "depth": 1,
#         "userMsg": {
#           "handle": "@artist",
#           "username": "Digital Artist",
#           "msg": "Congrats! Would love to see a cyberpunk version"
#         }
#       },
#       {
#         "depth": 2,
#         "userMsg": {
#           "handle": "@art_ai",
#           "username": "Art AI",
#           "msg": "Generate cyberpunk NFT artwork with neon colors and futuristic city"
#         }
#       }
#     ]
#   }'

# # Example 6: Text-only conversation
# echo -e "\n\n=== V2 Example 6: Simple Text Conversation ==="
# echo "Scenario: Pure text discussion without media generation"
# curl -X POST "$BASE_URL/api/v2/conversation" \
#   -H "Content-Type: application/json" \
#   -d '{
#     "context": [
#       {
#         "depth": 0,
#         "userMsg": {
#           "handle": "@dev_john",
#           "username": "Developer John",
#           "msg": "How do I fix CORS errors in Express?"
#         }
#       },
#       {
#         "depth": 1,
#         "userMsg": {
#           "handle": "@senior_dev",
#           "username": "Senior Dev",
#           "msg": "Explain the cors middleware setup and configuration"
#         }
#       }
#     ]
#   }'

# # Example 7: Long conversation thread
# echo -e "\n\n=== V2 Example 7: Long Conversation Thread ==="
# echo "Scenario: Extended discussion with multiple participants"
# curl -X POST "$BASE_URL/api/v2/conversation" \
#   -H "Content-Type: application/json" \
#   -d '{
#     "context": [
#       {
#         "depth": 0,
#         "userMsg": {
#           "handle": "@designer",
#           "username": "Mike Designer",
#           "msg": "Working on a new logo for our brand"
#         }
#       },
#       {
#         "depth": 1,
#         "userMsg": {
#           "handle": "@product",
#           "username": "Product Manager",
#           "msg": "Make sure it reflects our modern, tech-forward identity"
#         }
#       },
#       {
#         "depth": 2,
#         "userMsg": {
#           "handle": "@ceo",
#           "username": "CEO",
#           "msg": "I want it to have blue and purple gradients"
#         }
#       },
#       {
#         "depth": 3,
#         "userMsg": {
#           "handle": "@marketing",
#           "username": "Marketing",
#           "msg": "And include our tagline: Innovation First"
#         }
#       },
#       {
#         "depth": 4,
#         "userMsg": {
#           "handle": "@ai_designer",
#           "username": "AI Designer",
#           "msg": "Generate a modern tech logo with blue-purple gradient and Innovation First tagline"
#         }
#       }
#     ]
#   }'

echo -e "\n\n=========================================="
echo "=== All V2 API Tests Complete! ==="
echo "=========================================="
