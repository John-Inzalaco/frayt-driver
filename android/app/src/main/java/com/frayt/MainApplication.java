package com.frayt.fraytdriver;
import com.frayt.fraytdriver.generated.BasePackageList;

import android.app.Application;
import android.content.Context;

import org.unimodules.adapters.react.ModuleRegistryAdapter;
import org.unimodules.adapters.react.ReactModuleRegistryProvider;
import org.unimodules.core.interfaces.SingletonModule;

import com.facebook.react.PackageList;
import com.facebook.react.ReactApplication;
import com.arttitude360.reactnative.rngoogleplaces.RNGooglePlacesPackage;
import com.jamesisaac.rnbackgroundtask.BackgroundTaskPackage;
import com.reactnativecommunity.netinfo.NetInfoPackage;
import com.reactnativecommunity.rnpermissions.RNPermissionsPackage;
import com.geektime.rnonesignalandroid.ReactNativeOneSignalPackage;
import com.github.yamill.orientation.OrientationPackage;
import com.transistorsoft.rnbackgroundfetch.RNBackgroundFetchPackage;
import org.devio.rn.splashscreen.SplashScreenReactPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.soloader.SoLoader;
import java.lang.reflect.InvocationTargetException;
import java.util.Arrays;
import java.util.List;
import com.microsoft.codepush.react.CodePush;
import com.robinpowered.react.Intercom.IntercomPackage;
import io.intercom.android.sdk.Intercom;

public class MainApplication extends Application implements ReactApplication {

  private final ReactModuleRegistryProvider mModuleRegistryProvider = new ReactModuleRegistryProvider(
    new BasePackageList().getPackageList(), Arrays.<SingletonModule>asList()
  );

  private final ReactNativeHost mReactNativeHost =
      new ReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
          return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
          @SuppressWarnings("UnnecessaryLocalVariable")
          List<ReactPackage> packages = new PackageList(this).getPackages();
          // Packages that cannot be autolinked yet can be added manually here, for example:
          // packages.add(new MyReactNativePackage());
          packages.add(new IntercomPackage());
          // Add unimodules
          List<ReactPackage> unimodules = Arrays.<ReactPackage>asList(
            // Code Push seems to work without this... try uncommenting if you run into issues with CodePush
            // new CodePush(getResources().getString(com.frayt.fraytdriver.R.string.CodePushDeploymentKey), MainApplication.this, BuildConfig.DEBUG),
            new ModuleRegistryAdapter(mModuleRegistryProvider)
            );
          packages.addAll(unimodules);
          return packages;
        }

        @Override
        protected String getJSMainModuleName() {
          return "index";
        }

        @Override
        protected String getJSBundleFile() {
            return CodePush.getJSBundleFile();
        }
      };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    Intercom.initialize(this, "android_sdk-899beb8006814026c02354f583c3037903a47325", "pacfxq61");
    SoLoader.init(this, /* native exopackage */ false);
    // initializeFlipper(this); // Remove this line if you don't want Flipper enabled
    BackgroundTaskPackage.useContext(this);
  }

  /**
   * Loads Flipper in React Native templates.
   *
   * @param context
   */
  private static void initializeFlipper(Context context) {
    if (BuildConfig.DEBUG) {
      try {
        /*
         We use reflection here to pick up the class that initializes Flipper,
        since Flipper library is not available in release mode
        */
        Class<?> aClass = Class.forName("com.facebook.flipper.ReactNativeFlipper");
        aClass.getMethod("initializeFlipper", Context.class).invoke(null, context);
      } catch (ClassNotFoundException e) {
        e.printStackTrace();
      } catch (NoSuchMethodException e) {
        e.printStackTrace();
      } catch (IllegalAccessException e) {
        e.printStackTrace();
      } catch (InvocationTargetException e) {
        e.printStackTrace();
      }
    }
  }
}
