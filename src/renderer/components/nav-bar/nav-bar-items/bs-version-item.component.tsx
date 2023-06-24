import { BSVersion } from 'shared/bs-version.interface';
import { Link, useLocation } from "react-router-dom";
import { BsDownloaderService } from "renderer/services/bs-downloader.service";
import { distinctUntilChanged, map, of, switchMap } from "rxjs";
import { BSLauncherService, LaunchMods } from "renderer/services/bs-launcher.service";
import { ConfigurationService } from "renderer/services/configuration.service";
import { BSUninstallerService } from "renderer/services/bs-uninstaller.service";
import { BSVersionManagerService } from "renderer/services/bs-version-manager.service";
import { BsmIcon } from "../../svgs/bsm-icon.component";
import { useThemeColor } from 'renderer/hooks/use-theme-color.hook';
import { NavBarItem } from './nav-bar-item.component';
import useFitText from 'use-fit-text';
import Tippy from '@tippyjs/react';
import { useService } from 'renderer/hooks/use-service.hook';
import { useObservable } from 'renderer/hooks/use-observable.hook';
import equal from 'fast-deep-equal';

export function BsVersionItem(props: {version: BSVersion}) {

    const downloaderService = useService(BsDownloaderService);
    const verionManagerService = useService(BSVersionManagerService);
    const launcherService = useService(BSLauncherService);
    const configService = useService(ConfigurationService);
    const bsUninstallerService = useService(BSUninstallerService);

    const { state } = useLocation() as { state: BSVersion};
    const { fontSize, ref } = useFitText();

    const [downloading, downloading$] = useObservable(downloaderService.currentBsVersionDownload$.pipe(
        map(version => equal(props.version, version)),
        distinctUntilChanged()
    ), false);

    const [downloadPercent] = useObservable(downloading$.pipe(
        switchMap(downloading => downloading ? downloaderService.downloadProgress$ : of(0)),
        distinctUntilChanged()
    ));

    const secondColor = useThemeColor("second-color");

    const isActive = (): boolean => {
        return props.version?.BSVersion === state?.BSVersion && props?.version.steam === state?.steam && props?.version.oculus === state?.oculus && props?.version.name === state?.name;
    }

    const handleDoubleClick = () => {
        launcherService.launch(
            state,
            !!configService.get<boolean>(LaunchMods.OCULUS_MOD),
            !!configService.get<boolean>(LaunchMods.DESKTOP_MOD),
            !!configService.get<boolean>(LaunchMods.DEBUG_MOD)
        )
    }

    const cancel = () => {
        const versionDownload = downloaderService.currentBsVersionDownload$.value;
        const wasVerification = downloaderService.isVerification;
        downloaderService.cancelDownload().then(async res => {
            if(!res.success){ return; }
            if(!wasVerification){
                bsUninstallerService.uninstall(versionDownload).then(res => res && verionManagerService.askInstalledVersions());
            }
        });
    }

    const renderIcon = () => {
        const classes = "w-[19px] h-[19px] mr-[5px] shrink-0"
        if(props.version.steam){
            return <BsmIcon icon="steam" className={classes}/>
        }
        if(props.version.oculus){
            return <BsmIcon icon="oculus" className={`${classes} p-[2px] rounded-full bg-main-color-1 text-white dark:bg-white dark:text-black`}/>
        }
        return <BsmIcon icon="bsNote" className={classes} style={{color: props.version?.color ?? secondColor}}/>
    }

    const renderVersionText = () => {
        if(props.version.name){
            return (
                <div className="h-8 flex items-center dark:text-gray-200 text-gray-800 overflow-hidden">
                    <div ref={ref} className='whitespace-nowrap font-bold tracking-wide w-full text-center' style={{fontSize}}>{props.version.name}</div>
                </div>
            )
        }
        return (
            <div className="h-8 flex items-center text-xl dark:text-gray-200 text-gray-800 font-bold tracking-wide">
                <span className='pb-[2px] max-w-full text-ellipsis'>{props.version.BSVersion}</span>
            </div>
        )
    }


    return (
        <NavBarItem onCancel={cancel} progress={downloading ? downloadPercent : 0} isActive={isActive() && !downloading} isDownloading={downloading}>
            {props.version.name ? (
                <Tippy content={props.version.BSVersion} placement="right-end" arrow={false} className="font-bold !bg-neutral-900" duration={[100, 0]} animation="shift-away-subtle">
                    <Link onDoubleClick={handleDoubleClick} to={`/bs-version/${props.version.BSVersion}`} state={props.version} className="w-full flex items-center justify-start content-center max-w-full">
                        {renderIcon()}
                        {renderVersionText()}
                    </Link>
                </Tippy>
            ) : (
                <Link onDoubleClick={handleDoubleClick} to={`/bs-version/${props.version.BSVersion}`} state={props.version} className="w-full flex items-center justify-start content-center max-w-full">
                    {renderIcon()}
                    {renderVersionText()}
                </Link>
            )}
            
        </NavBarItem>
    )
}