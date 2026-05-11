import { RuntimeConfig as UserRuntimeConfig, PublicRuntimeConfig as UserPublicRuntimeConfig } from 'nuxt/schema'
import { NuxtModule, ModuleDependencyMeta } from '@nuxt/schema'
  interface SharedRuntimeConfig {
   app: {
      buildId: string,

      baseURL: string,

      buildAssetsDir: string,

      cdnURL: string,
   },

   sessionPassword: string,

   nitro: {
      envPrefix: string,
   },

   session: {
      name: string,

      password: string,

      cookie: {
         sameSite: string,
      },
   },

   hash: {
      scrypt: any,
   },

   webauthn: {
      register: any,

      authenticate: any,
   },

   oauth: {
      gitea: {
         clientId: string,

         clientSecret: string,

         redirectURL: string,

         baseURL: string,
      },

      box: {
         clientId: string,

         clientSecret: string,

         redirectURL: string,

         scope: Array<any>,
      },

      github: {
         clientId: string,

         clientSecret: string,

         redirectURL: string,
      },

      gitlab: {
         clientId: string,

         clientSecret: string,

         redirectURL: string,

         baseURL: string,
      },

      spotify: {
         clientId: string,

         clientSecret: string,

         redirectURL: string,
      },

      google: {
         clientId: string,

         clientSecret: string,

         redirectURL: string,
      },

      twitch: {
         clientId: string,

         clientSecret: string,

         redirectURL: string,
      },

      auth0: {
         clientId: string,

         clientSecret: string,

         domain: string,

         audience: string,

         redirectURL: string,
      },

      workos: {
         clientId: string,

         clientSecret: string,

         connectionId: string,

         screenHint: string,

         redirectURL: string,
      },

      microsoft: {
         clientId: string,

         clientSecret: string,

         tenant: string,

         scope: Array<any>,

         authorizationURL: string,

         tokenURL: string,

         userURL: string,

         redirectURL: string,
      },

      azureb2c: {
         clientId: string,

         policy: string,

         tenant: string,

         scope: Array<any>,

         authorizationURL: string,

         tokenURL: string,

         userURL: string,

         redirectURL: string,
      },

      discord: {
         clientId: string,

         clientSecret: string,

         redirectURL: string,
      },

      battledotnet: {
         clientId: string,

         clientSecret: string,

         redirectURL: string,
      },

      bluesky: {
         clientMetadataFilename: string,

         clientName: string,

         clientUri: any,

         logoUri: any,

         policyUri: any,

         tosUri: any,

         scope: Array<string>,

         grantTypes: Array<string>,

         responseTypes: Array<string>,

         applicationType: string,

         redirectUris: any,

         dpopBoundAccessTokens: boolean,

         tokenEndpointAuthMethod: string,
      },

      keycloak: {
         clientId: string,

         clientSecret: string,

         serverUrl: string,

         serverUrlInternal: string,

         realm: string,

         redirectURL: string,
      },

      linear: {
         clientId: string,

         clientSecret: string,

         redirectURL: string,
      },

      linkedin: {
         clientId: string,

         clientSecret: string,

         redirectURL: string,
      },

      cognito: {
         clientId: string,

         clientSecret: string,

         region: string,

         userPoolId: string,

         redirectURL: string,
      },

      facebook: {
         clientId: string,

         clientSecret: string,

         redirectURL: string,
      },

      instagram: {
         clientId: string,

         clientSecret: string,

         redirectURL: string,
      },

      paypal: {
         clientId: string,

         clientSecret: string,

         redirectURL: string,
      },

      steam: {
         apiKey: string,

         redirectURL: string,
      },

      x: {
         clientId: string,

         clientSecret: string,

         redirectURL: string,
      },

      xsuaa: {
         clientId: string,

         clientSecret: string,

         domain: string,

         redirectURL: string,
      },

      vk: {
         clientId: string,

         clientSecret: string,

         redirectURL: string,
      },

      yandex: {
         clientId: string,

         clientSecret: string,

         redirectURL: string,
      },

      tiktok: {
         clientKey: string,

         clientSecret: string,

         redirectURL: string,
      },

      dropbox: {
         clientId: string,

         clientSecret: string,

         redirectURL: string,
      },

      polar: {
         clientId: string,

         clientSecret: string,

         redirectURL: string,
      },

      zitadel: {
         clientId: string,

         clientSecret: string,

         domain: string,

         redirectURL: string,
      },

      authentik: {
         clientId: string,

         clientSecret: string,

         domain: string,

         redirectURL: string,
      },

      seznam: {
         clientId: string,

         clientSecret: string,

         redirectURL: string,
      },

      strava: {
         clientId: string,

         clientSecret: string,

         redirectURL: string,
      },

      hubspot: {
         clientId: string,

         clientSecret: string,

         redirectURL: string,
      },

      line: {
         clientId: string,

         clientSecret: string,

         redirectURL: string,
      },

      atlassian: {
         clientId: string,

         clientSecret: string,

         redirectURL: string,
      },

      apple: {
         teamId: string,

         keyId: string,

         privateKey: string,

         redirectURL: string,

         clientId: string,
      },

      kick: {
         clientId: string,

         clientSecret: string,

         redirectURL: string,
      },

      livechat: {
         clientId: string,

         clientSecret: string,
      },

      salesforce: {
         clientId: string,

         clientSecret: string,

         redirectURL: string,

         baseURL: string,

         scope: string,
      },

      slack: {
         clientId: string,

         clientSecret: string,

         redirectURL: string,

         scope: string,
      },

      heroku: {
         clientId: string,

         clientSecret: string,

         redirectURL: string,

         scope: string,
      },

      roblox: {
         clientId: string,

         clientSecret: string,

         redirectURL: string,

         scope: string,
      },

      okta: {
         clientId: string,

         clientSecret: string,

         domain: string,

         audience: string,

         scope: Array<any>,

         redirectURL: string,
      },

      ory: {
         clientId: string,

         clientSecret: string,

         sdkURL: string,

         redirectURL: string,

         scope: Array<any>,

         authorizationURL: string,

         tokenURL: string,

         userURL: string,
      },

      shopifyCustomer: {
         shopDomain: string,

         clientId: string,

         redirectURL: string,

         scope: Array<any>,
      },

      oidc: {
         clientId: string,

         clientSecret: string,

         openidConfig: string,

         redirectURL: string,

         scope: Array<any>,
      },

      osu: {
         clientId: string,

         clientSecret: string,

         redirectURL: string,

         scope: Array<any>,
      },

      riotgames: {
         clientId: string,

         clientSecret: string,

         redirectURL: string,

         scope: Array<any>,
      },
   },
  }
  interface SharedPublicRuntimeConfig {
   naiveui: {
      colorModePreference: string,

      colorModePreferenceCookieName: string,

      iconDownload: boolean,

      iconCollectionsUrl: string,

      iconSize: number,

      spaLoadingTemplate: any,

      themeConfig: {
         dark: {
            common: {
               lineHeight: string,

               textColorBase: string,

               primaryColor: string,

               primaryColorHover: string,

               primaryColorPressed: string,

               primaryColorSuppl: string,

               infoColor: string,

               infoColorHover: string,

               infoColorPressed: string,

               infoColorSuppl: string,

               successColor: string,

               successColorHover: string,

               successColorPressed: string,

               successColorSuppl: string,

               warningColor: string,

               warningColorHover: string,

               warningColorPressed: string,

               warningColorSuppl: string,

               errorColor: string,

               errorColorHover: string,

               errorColorPressed: string,

               errorColorSuppl: string,

               tabColor: string,

               tableColorStriped: string,

               pressedColor: string,

               actionColor: string,

               tableHeaderColor: string,

               tableColorHover: string,

               inputColorDisabled: string,

               buttonColor2: string,

               buttonColor2Pressed: string,

               closeColorPressed: string,

               dividerColor: string,

               borderColor: string,

               hoverColor: string,

               inputColor: string,

               buttonColor2Hover: string,

               closeColorHover: string,

               progressRailColor: string,

               codeColor: string,

               avatarColor: string,

               scrollbarColor: string,

               railColor: string,

               placeholderColorDisabled: string,

               iconColorDisabled: string,

               iconColorPressed: string,

               clearColorPressed: string,

               scrollbarColorHover: string,

               placeholderColor: string,

               textColorDisabled: string,

               clearColor: string,

               iconColor: string,

               iconColorHover: string,

               clearColorHover: string,

               closeIconColorHover: string,

               closeIconColor: string,

               closeIconColorPressed: string,

               textColor3: string,

               textColor2: string,

               textColor1: string,

               bodyColor: string,

               baseColor: string,

               invertedColor: string,

               tableColor: string,

               cardColor: string,

               tagColor: string,

               modalColor: string,

               popoverColor: string,
            },

            Skeleton: {
               color: string,

               colorEnd: string,
            },

            Tag: {
               colorBordered: string,
            },

            Tooltip: {
               color: string,

               textColor: string,
            },

            Slider: {
               indicatorColor: string,

               indicatorTextColor: string,
            },

            Layout: {
               siderColor: string,

               headerColor: string,

               footerColor: string,
            },

            Tabs: {
               tabColorSegment: string,
            },

            IconWrapper: {
               color: string,

               iconColor: string,
            },

            Input: {
               lineHeightTextarea: string,
            },

            LoadingBar: {
               height: string,
            },

            Form: {
               feedbackPadding: string,
            },
         },

         light: {
            common: {
               lineHeight: string,

               textColorBase: string,

               bodyColor: string,

               textColor1: string,

               textColor2: string,

               textColor3: string,
            },

            Menu: {
               itemTextColorHorizontalInverted: string,

               itemIconColorInverted: string,

               itemTextColorInverted: string,

               itemTextColorHoverHorizontalInverted: string,

               itemIconColorHoverHorizontalInverted: string,

               itemTextColorActiveHorizontalInverted: string,

               itemIconColorActiveHorizontalInverted: string,

               itemTextColorActiveHoverHorizontalInverted: string,

               itemIconColorActiveHoverHorizontalInverted: string,

               itemTextColorChildActiveHorizontalInverted: string,

               itemIconColorChildActiveHorizontalInverted: string,

               itemTextColorChildActiveHoverHorizontalInverted: string,

               itemIconColorChildActiveHoverHorizontalInverted: string,

               itemTextColorHoverInverted: string,

               itemIconColorHoverInverted: string,

               arrowColorHoverInverted: string,

               itemTextColorChildActiveInverted: string,

               itemIconColorChildActiveHoverInverted: string,

               itemIconColorChildActiveInverted: string,

               arrowColorChildActiveInverted: string,

               arrowColorChildActiveHoverInverted: string,

               arrowColorActiveInverted: string,

               arrowColorActiveHoverInverted: string,
            },

            Layout: {
               siderColor: string,

               headerColor: string,

               footerColor: string,
            },

            IconWrapper: {
               color: string,

               iconColor: string,
            },

            Input: {
               lineHeightTextarea: string,
            },

            LoadingBar: {
               height: string,
            },

            Form: {
               feedbackPadding: string,
            },
         },

         mobileOrTablet: {
            common: {
               fontSize: string,

               heightMedium: string,

               fontSizeMedium: string,
            },

            Form: {
               labelFontSizeTopMedium: string,
            },

            Input: {
               heightMedium: string,

               fontSizeMedium: string,
            },

            Button: {
               heightMedium: string,

               fontSizeMedium: string,
            },

            Card: {
               fontSizeMedium: string,
            },

            Avatar: {
               heightMedium: string,

               fontSize: string,
            },

            ColorPicker: {
               heightMedium: string,

               fontSizeMedium: string,
            },

            Dropdown: {
               optionHeightMedium: string,

               fontSizeMedium: string,
            },

            Radio: {
               buttonHeightMedium: string,

               fontSizeMedium: string,
            },

            Skeleton: {
               heightMedium: string,
            },

            Tag: {
               heightMedium: string,

               fontSizeMedium: string,
            },

            Result: {
               fontSizeMedium: string,
            },

            Tabs: {
               tabFontSizeMedium: string,
            },

            Pagination: {
               itemSizeMedium: string,
            },
         },

         mobile: any,

         shared: any,
      },
   },

   apiBaseUrl: string,

   auth: {
      loadStrategy: string,
   },

   i18n: {
      baseUrl: string,

      defaultLocale: string,

      rootRedirect: any,

      redirectStatusCode: number,

      skipSettingLocaleOnNavigate: boolean,

      locales: Array<{

      }>,

      detectBrowserLanguage: {
         alwaysRedirect: boolean,

         cookieCrossOrigin: boolean,

         cookieDomain: any,

         cookieKey: string,

         cookieSecure: boolean,

         fallbackLocale: string,

         redirectOn: string,

         useCookie: boolean,
      },

      experimental: {
         localeDetector: string,

         typedPages: boolean,

         typedOptionsAndMessages: boolean,

         alternateLinkCanonicalQueries: boolean,

         devCache: boolean,

         cacheLifetime: any,

         stripMessagesPayload: boolean,

         preload: boolean,

         strictSeo: boolean,

         nitroContextDetection: boolean,

         httpCacheDuration: number,

         compactRoutes: boolean,
      },

      domainLocales: {
         az: {
            domain: string,
         },

         en: {
            domain: string,
         },

         ru: {
            domain: string,
         },
      },
   },
  }
declare module '@nuxt/schema' {
  interface ModuleDependencies {
    ["auth-utils"]?: ModuleDependencyMeta<typeof import("nuxt-auth-utils").default extends NuxtModule<infer O> ? O | false : Record<string, unknown>> | false
    ["@bg-dev/nuxt-naiveui"]?: ModuleDependencyMeta<typeof import("@bg-dev/nuxt-naiveui").default extends NuxtModule<infer O> ? O | false : Record<string, unknown>> | false
    ["@nuxt/image"]?: ModuleDependencyMeta<typeof import("@nuxt/image").default extends NuxtModule<infer O> ? O | false : Record<string, unknown>> | false
    ["@nuxtjs/i18n"]?: ModuleDependencyMeta<typeof import("@nuxtjs/i18n").default extends NuxtModule<infer O> ? O | false : Record<string, unknown>> | false
    ["@nuxt/telemetry"]?: ModuleDependencyMeta<typeof import("@nuxt/telemetry").default extends NuxtModule<infer O> ? O | false : Record<string, unknown>> | false
  }
  interface NuxtOptions {
    /**
     * Configuration for `nuxt-auth-utils`
     */
    ["auth"]: typeof import("nuxt-auth-utils").default extends NuxtModule<infer O, unknown, boolean> ? O | false : Record<string, any> | false
    /**
     * Configuration for `@bg-dev/nuxt-naiveui`
     */
    ["naiveui"]: typeof import("@bg-dev/nuxt-naiveui").default extends NuxtModule<infer O, unknown, boolean> ? O | false : Record<string, any> | false
    /**
     * Configuration for `@nuxt/image`
     */
    ["image"]: typeof import("@nuxt/image").default extends NuxtModule<infer O, unknown, boolean> ? O | false : Record<string, any> | false
    /**
     * Configuration for `@nuxtjs/i18n`
     */
    ["i18n"]: typeof import("@nuxtjs/i18n").default extends NuxtModule<infer O, unknown, boolean> ? O | false : Record<string, any> | false
    /**
     * Configuration for `@nuxt/telemetry`
     */
    ["telemetry"]: typeof import("@nuxt/telemetry").default extends NuxtModule<infer O, unknown, boolean> ? O | false : Record<string, any> | false
  }
  interface NuxtConfig {
    /**
     * Configuration for `nuxt-auth-utils`
     */
    ["auth"]?: typeof import("nuxt-auth-utils").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false
    /**
     * Configuration for `@bg-dev/nuxt-naiveui`
     */
    ["naiveui"]?: typeof import("@bg-dev/nuxt-naiveui").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false
    /**
     * Configuration for `@nuxt/image`
     */
    ["image"]?: typeof import("@nuxt/image").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false
    /**
     * Configuration for `@nuxtjs/i18n`
     */
    ["i18n"]?: typeof import("@nuxtjs/i18n").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false
    /**
     * Configuration for `@nuxt/telemetry`
     */
    ["telemetry"]?: typeof import("@nuxt/telemetry").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false
    modules?: (undefined | null | false | NuxtModule<any> | string | [NuxtModule | string, Record<string, any>] | ["nuxt-auth-utils", Exclude<NuxtConfig["auth"], boolean>] | ["@bg-dev/nuxt-naiveui", Exclude<NuxtConfig["naiveui"], boolean>] | ["@nuxt/image", Exclude<NuxtConfig["image"], boolean>] | ["@nuxtjs/i18n", Exclude<NuxtConfig["i18n"], boolean>] | ["@nuxt/telemetry", Exclude<NuxtConfig["telemetry"], boolean>])[],
  }
  interface RuntimeConfig extends UserRuntimeConfig {}
  interface PublicRuntimeConfig extends UserPublicRuntimeConfig {}
}
declare module 'nuxt/schema' {
  interface ModuleDependencies {
    ["auth-utils"]?: ModuleDependencyMeta<typeof import("nuxt-auth-utils").default extends NuxtModule<infer O> ? O | false : Record<string, unknown>> | false
    ["@bg-dev/nuxt-naiveui"]?: ModuleDependencyMeta<typeof import("@bg-dev/nuxt-naiveui").default extends NuxtModule<infer O> ? O | false : Record<string, unknown>> | false
    ["@nuxt/image"]?: ModuleDependencyMeta<typeof import("@nuxt/image").default extends NuxtModule<infer O> ? O | false : Record<string, unknown>> | false
    ["@nuxtjs/i18n"]?: ModuleDependencyMeta<typeof import("@nuxtjs/i18n").default extends NuxtModule<infer O> ? O | false : Record<string, unknown>> | false
    ["@nuxt/telemetry"]?: ModuleDependencyMeta<typeof import("@nuxt/telemetry").default extends NuxtModule<infer O> ? O | false : Record<string, unknown>> | false
  }
  interface NuxtOptions {
    /**
     * Configuration for `nuxt-auth-utils`
     * @see https://www.npmjs.com/package/nuxt-auth-utils
     */
    ["auth"]: typeof import("nuxt-auth-utils").default extends NuxtModule<infer O, unknown, boolean> ? O | false : Record<string, any> | false
    /**
     * Configuration for `@bg-dev/nuxt-naiveui`
     * @see https://www.npmjs.com/package/@bg-dev/nuxt-naiveui
     */
    ["naiveui"]: typeof import("@bg-dev/nuxt-naiveui").default extends NuxtModule<infer O, unknown, boolean> ? O | false : Record<string, any> | false
    /**
     * Configuration for `@nuxt/image`
     * @see https://www.npmjs.com/package/@nuxt/image
     */
    ["image"]: typeof import("@nuxt/image").default extends NuxtModule<infer O, unknown, boolean> ? O | false : Record<string, any> | false
    /**
     * Configuration for `@nuxtjs/i18n`
     * @see https://www.npmjs.com/package/@nuxtjs/i18n
     */
    ["i18n"]: typeof import("@nuxtjs/i18n").default extends NuxtModule<infer O, unknown, boolean> ? O | false : Record<string, any> | false
    /**
     * Configuration for `@nuxt/telemetry`
     * @see https://www.npmjs.com/package/@nuxt/telemetry
     */
    ["telemetry"]: typeof import("@nuxt/telemetry").default extends NuxtModule<infer O, unknown, boolean> ? O | false : Record<string, any> | false
  }
  interface NuxtConfig {
    /**
     * Configuration for `nuxt-auth-utils`
     * @see https://www.npmjs.com/package/nuxt-auth-utils
     */
    ["auth"]?: typeof import("nuxt-auth-utils").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false
    /**
     * Configuration for `@bg-dev/nuxt-naiveui`
     * @see https://www.npmjs.com/package/@bg-dev/nuxt-naiveui
     */
    ["naiveui"]?: typeof import("@bg-dev/nuxt-naiveui").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false
    /**
     * Configuration for `@nuxt/image`
     * @see https://www.npmjs.com/package/@nuxt/image
     */
    ["image"]?: typeof import("@nuxt/image").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false
    /**
     * Configuration for `@nuxtjs/i18n`
     * @see https://www.npmjs.com/package/@nuxtjs/i18n
     */
    ["i18n"]?: typeof import("@nuxtjs/i18n").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false
    /**
     * Configuration for `@nuxt/telemetry`
     * @see https://www.npmjs.com/package/@nuxt/telemetry
     */
    ["telemetry"]?: typeof import("@nuxt/telemetry").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false
    modules?: (undefined | null | false | NuxtModule<any> | string | [NuxtModule | string, Record<string, any>] | ["nuxt-auth-utils", Exclude<NuxtConfig["auth"], boolean>] | ["@bg-dev/nuxt-naiveui", Exclude<NuxtConfig["naiveui"], boolean>] | ["@nuxt/image", Exclude<NuxtConfig["image"], boolean>] | ["@nuxtjs/i18n", Exclude<NuxtConfig["i18n"], boolean>] | ["@nuxt/telemetry", Exclude<NuxtConfig["telemetry"], boolean>])[],
  }
  interface RuntimeConfig extends SharedRuntimeConfig {}
  interface PublicRuntimeConfig extends SharedPublicRuntimeConfig {}
}
declare module 'vue' {
        interface ComponentCustomProperties {
          $config: UserRuntimeConfig
        }
      }