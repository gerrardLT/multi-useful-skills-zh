# 用户故事示例

## 示例 1：好的用户故事

```markdown
### User Story 042:

- **Summary:** Enable Google login for trial users to reduce signup friction

#### Use Case:
- **As a** trial user visiting the app for the first time
- **I want to** log in using my Google account
- **so that** I can access the app without creating and remembering a new password

#### Acceptance Criteria:

- **Scenario:** First-time trial user logs in via Google OAuth
- **Given:** I am on the login page
- **and Given:** I have a Google account
- **and Given:** The "Sign in with Google" button is visible
- **When:** I click the "Sign in with Google" button and authorize the app
- **Then:** I am logged into the app and redirected to the onboarding flow
```

**为什么这个例子有效：**
- Persona 足够具体，是 “首次访问的 trial user”
- Action 很清晰，即 “用 Google 账号登录”
- Outcome 解释了动机，即 “不用再创建和记住一个新密码”
- 验收标准可测试，QA 能逐步验证
- 只有一个 When 和一个 Then，范围控制得当

---

## 示例 2：糟糕的用户故事（过于模糊）

```markdown
### User Story 999:

- **Summary:** Improve login experience

#### Use Case:
- **As a** user
- **I want to** better login
- **so that** I can use the app

#### Acceptance Criteria:

- **Scenario:** User logs in
- **Given:** I want to log in
- **and Given:** I have an active account
- **When:** I log in
- **Then:** It works better
```

**为什么这个例子失败：**
- `user` 太泛，无法区分 trial user、returning user 还是 admin
- `better login` 不是动作，不知道到底要做什么
- `use the app` 不是明确结果，任何人都可以这么说
- 验收标准无法测试，`works better` 没法验证

**如何修正：**
- 缩小 persona：如 `trial user`、`returning user without password manager`
- 明确动作：如 `log in using Google`、`reset my password via email`
- 具体化结果：如 `without remembering a new password`、`in under 30 seconds`
- 把验收标准写成可证伪：如 `Then I am redirected to the dashboard within 2 seconds`

---

## 示例 3：需要拆分的故事

```markdown
### User Story 100:

- **Summary:** Manage shopping cart

#### Use Case:
- **As a** shopper
- **I want to** add items, remove items, update quantities, apply coupons, and checkout
- **so that** I can complete my purchase

#### Acceptance Criteria:

- **Scenario:** Shopping cart management
- **Given:** I have items in my cart
- **When:** I add an item
- **Then:** It appears in the cart
- **When:** I remove an item
- **Then:** It disappears from the cart
- **When:** I update quantity
- **Then:** The quantity changes
- **When:** I apply a coupon
- **Then:** The discount is applied
- **When:** I checkout
- **Then:** I proceed to payment
```

**为什么它需要拆分：**
- 出现了多个 `When`，本质上就是多条 stories
- 范围太大，通常无法在一个 sprint 内完成
- 不同结果之间关系不够紧密，例如添加商品和使用优惠券

**如何拆分：**
使用 `skills/user-story-splitting/SKILL.md`，把它拆成：
1. `Add items to cart`
2. `Remove items from cart`
3. `Update item quantities`
4. `Apply discount coupons`
5. `Checkout and proceed to payment`

拆完后每一条 story 都会有更聚焦的验收标准。