import xmldom = require('xmldom');

import { TileTemplateType } from './TileTemplateType';

export class TileUpdateManager {
    //
    // Generated with the following
    //
    // (async () => {
    //     let str = '';
    //     for (const x in Windows.UI.Notifications.TileTemplateType) {
    //         str += (`[TileTemplateType.${x}]: '${Windows.UI.Notifications.TileUpdateManager.getTemplateContent(Windows.UI.Notifications.TileTemplateType[x]).getXml()}',\n`)
    //     }
    //     let file = await Windows.Storage.ApplicationData.current.localFolder.createFileAsync("test.txt")
    //     await Windows.Storage.FileIO.writeTextAsync(file, str);
    // })();

    private static TEMPLATE_MAP = {
        [TileTemplateType.tileSquare150x150Image]:
            '<tile><visual version="4"><binding template="TileSquare150x150Image" fallback="TileSquareImage"><image id="1" src=""/></binding></visual></tile>',
        [TileTemplateType.tileSquare150x150Block]:
            '<tile><visual version="4"><binding template="TileSquare150x150Block" fallback="TileSquareBlock"><text id="1"></text><text id="2"></text></binding></visual></tile>',
        [TileTemplateType.tileSquare150x150Text01]:
            '<tile><visual version="4"><binding template="TileSquare150x150Text01" fallback="TileSquareText01"><text id="1"></text><text id="2"></text><text id="3"></text><text id="4"></text></binding></visual></tile>',
        [TileTemplateType.tileSquare150x150Text02]:
            '<tile><visual version="4"><binding template="TileSquare150x150Text02" fallback="TileSquareText02"><text id="1"></text><text id="2"></text></binding></visual></tile>',
        [TileTemplateType.tileSquare150x150Text03]:
            '<tile><visual version="4"><binding template="TileSquare150x150Text03" fallback="TileSquareText03"><text id="1"></text><text id="2"></text><text id="3"></text><text id="4"></text></binding></visual></tile>',
        [TileTemplateType.tileSquare150x150Text04]:
            '<tile><visual version="4"><binding template="TileSquare150x150Text04" fallback="TileSquareText04"><text id="1"></text></binding></visual></tile>',
        [TileTemplateType.tileSquare150x150PeekImageAndText01]:
            '<tile><visual version="4"><binding template="TileSquare150x150PeekImageAndText01" fallback="TileSquarePeekImageAndText01"><image id="1" src=""/><text id="1"></text><text id="2"></text><text id="3"></text><text id="4"></text></binding></visual></tile>',
        [TileTemplateType.tileSquare150x150PeekImageAndText02]:
            '<tile><visual version="4"><binding template="TileSquare150x150PeekImageAndText02" fallback="TileSquarePeekImageAndText02"><image id="1" src=""/><text id="1"></text><text id="2"></text></binding></visual></tile>',
        [TileTemplateType.tileSquare150x150PeekImageAndText03]:
            '<tile><visual version="4"><binding template="TileSquare150x150PeekImageAndText03" fallback="TileSquarePeekImageAndText03"><image id="1" src=""/><text id="1"></text><text id="2"></text><text id="3"></text><text id="4"></text></binding></visual></tile>',
        [TileTemplateType.tileSquare150x150PeekImageAndText04]:
            '<tile><visual version="4"><binding template="TileSquare150x150PeekImageAndText04" fallback="TileSquarePeekImageAndText04"><image id="1" src=""/><text id="1"></text></binding></visual></tile>',
        [TileTemplateType.tileWide310x150Image]:
            '<tile><visual version="4"><binding template="TileWide310x150Image" fallback="TileWideImage"><image id="1" src=""/></binding></visual></tile>',
        [TileTemplateType.tileWide310x150ImageCollection]:
            '<tile><visual version="4"><binding template="TileWide310x150ImageCollection" fallback="TileWideImageCollection"><image id="1" src=""/><image id="2" src=""/><image id="3" src=""/><image id="4" src=""/><image id="5" src=""/></binding></visual></tile>',
        [TileTemplateType.tileWide310x150ImageAndText01]:
            '<tile><visual version="4"><binding template="TileWide310x150ImageAndText01" fallback="TileWideImageAndText01"><image id="1" src=""/><text id="1"></text></binding></visual></tile>',
        [TileTemplateType.tileWide310x150ImageAndText02]:
            '<tile><visual version="4"><binding template="TileWide310x150ImageAndText02" fallback="TileWideImageAndText02"><image id="1" src=""/><text id="1"></text><text id="2"></text></binding></visual></tile>',
        [TileTemplateType.tileWide310x150BlockAndText01]:
            '<tile><visual version="4"><binding template="TileWide310x150BlockAndText01" fallback="TileWideBlockAndText01"><text id="1"></text><text id="2"></text><text id="3"></text><text id="4"></text><text id="5"></text><text id="6"></text></binding></visual></tile>',
        [TileTemplateType.tileWide310x150BlockAndText02]:
            '<tile><visual version="4"><binding template="TileWide310x150BlockAndText02" fallback="TileWideBlockAndText02"><text id="1"></text><text id="2"></text><text id="3"></text></binding></visual></tile>',
        [TileTemplateType.tileWide310x150PeekImageCollection01]:
            '<tile><visual version="4"><binding template="TileWide310x150PeekImageCollection01" fallback="TileWidePeekImageCollection01"><image id="1" src=""/><image id="2" src=""/><image id="3" src=""/><image id="4" src=""/><image id="5" src=""/><text id="1"></text><text id="2"></text></binding></visual></tile>',
        [TileTemplateType.tileWide310x150PeekImageCollection02]:
            '<tile><visual version="4"><binding template="TileWide310x150PeekImageCollection02" fallback="TileWidePeekImageCollection02"><image id="1" src=""/><image id="2" src=""/><image id="3" src=""/><image id="4" src=""/><image id="5" src=""/><text id="1"></text><text id="2"></text><text id="3"></text><text id="4"></text><text id="5"></text></binding></visual></tile>',
        [TileTemplateType.tileWide310x150PeekImageCollection03]:
            '<tile><visual version="4"><binding template="TileWide310x150PeekImageCollection03" fallback="TileWidePeekImageCollection03"><image id="1" src=""/><image id="2" src=""/><image id="3" src=""/><image id="4" src=""/><image id="5" src=""/><text id="1"></text></binding></visual></tile>',
        [TileTemplateType.tileWide310x150PeekImageCollection04]:
            '<tile><visual version="4"><binding template="TileWide310x150PeekImageCollection04" fallback="TileWidePeekImageCollection04"><image id="1" src=""/><image id="2" src=""/><image id="3" src=""/><image id="4" src=""/><image id="5" src=""/><text id="1"></text></binding></visual></tile>',
        [TileTemplateType.tileWide310x150PeekImageCollection05]:
            '<tile><visual version="4"><binding template="TileWide310x150PeekImageCollection05" fallback="TileWidePeekImageCollection05"><image id="1" src=""/><image id="2" src=""/><image id="3" src=""/><image id="4" src=""/><image id="5" src=""/><image id="6" src=""/><text id="1"></text><text id="2"></text></binding></visual></tile>',
        [TileTemplateType.tileWide310x150PeekImageCollection06]:
            '<tile><visual version="4"><binding template="TileWide310x150PeekImageCollection06" fallback="TileWidePeekImageCollection06"><image id="1" src=""/><image id="2" src=""/><image id="3" src=""/><image id="4" src=""/><image id="5" src=""/><image id="6" src=""/><text id="1"></text></binding></visual></tile>',
        [TileTemplateType.tileWide310x150PeekImageAndText01]:
            '<tile><visual version="4"><binding template="TileWide310x150PeekImageAndText01" fallback="TileWidePeekImageAndText01"><image id="1" src=""/><text id="1"></text></binding></visual></tile>',
        [TileTemplateType.tileWide310x150PeekImageAndText02]:
            '<tile><visual version="4"><binding template="TileWide310x150PeekImageAndText02" fallback="TileWidePeekImageAndText02"><image id="1" src=""/><text id="1"></text><text id="2"></text><text id="3"></text><text id="4"></text><text id="5"></text></binding></visual></tile>',
        [TileTemplateType.tileWide310x150PeekImage01]:
            '<tile><visual version="4"><binding template="TileWide310x150PeekImage01" fallback="TileWidePeekImage01"><image id="1" src=""/><text id="1"></text><text id="2"></text></binding></visual></tile>',
        [TileTemplateType.tileWide310x150PeekImage02]:
            '<tile><visual version="4"><binding template="TileWide310x150PeekImage02" fallback="TileWidePeekImage02"><image id="1" src=""/><text id="1"></text><text id="2"></text><text id="3"></text><text id="4"></text><text id="5"></text></binding></visual></tile>',
        [TileTemplateType.tileWide310x150PeekImage03]:
            '<tile><visual version="4"><binding template="TileWide310x150PeekImage03" fallback="TileWidePeekImage03"><image id="1" src=""/><text id="1"></text></binding></visual></tile>',
        [TileTemplateType.tileWide310x150PeekImage04]:
            '<tile><visual version="4"><binding template="TileWide310x150PeekImage04" fallback="TileWidePeekImage04"><image id="1" src=""/><text id="1"></text></binding></visual></tile>',
        [TileTemplateType.tileWide310x150PeekImage05]:
            '<tile><visual version="4"><binding template="TileWide310x150PeekImage05" fallback="TileWidePeekImage05"><image id="1" src=""/><image id="2" src=""/><text id="1"></text><text id="2"></text></binding></visual></tile>',
        [TileTemplateType.tileWide310x150PeekImage06]:
            '<tile><visual version="4"><binding template="TileWide310x150PeekImage06" fallback="TileWidePeekImage06"><image id="1" src=""/><image id="2" src=""/><text id="1"></text></binding></visual></tile>',
        [TileTemplateType.tileWide310x150PeekImage07]:
            '<tile><visual version="4"><binding template="TileWide310x150PeekImage07" fallback="TileWidePeekImage07"><image id="1" src=""/><image id="2" src=""/><text id="1"></text></binding></visual></tile>',
        [TileTemplateType.tileWide310x150SmallImageAndText01]:
            '<tile><visual version="4"><binding template="TileWide310x150SmallImageAndText01" fallback="TileWideSmallImageAndText01"><image id="1" src=""/><text id="1"></text></binding></visual></tile>',
        [TileTemplateType.tileWide310x150SmallImageAndText02]:
            '<tile><visual version="4"><binding template="TileWide310x150SmallImageAndText02" fallback="TileWideSmallImageAndText02"><image id="1" src=""/><text id="1"></text><text id="2"></text><text id="3"></text><text id="4"></text><text id="5"></text></binding></visual></tile>',
        [TileTemplateType.tileWide310x150SmallImageAndText03]:
            '<tile><visual version="4"><binding template="TileWide310x150SmallImageAndText03" fallback="TileWideSmallImageAndText03"><image id="1" src=""/><text id="1"></text></binding></visual></tile>',
        [TileTemplateType.tileWide310x150SmallImageAndText04]:
            '<tile><visual version="4"><binding template="TileWide310x150SmallImageAndText04" fallback="TileWideSmallImageAndText04"><image id="1" src=""/><text id="1"></text><text id="2"></text></binding></visual></tile>',
        [TileTemplateType.tileWide310x150SmallImageAndText05]:
            '<tile><visual version="4"><binding template="TileWide310x150SmallImageAndText05" fallback="TileWideSmallImageAndText05"><image id="1" src=""/><text id="1"></text><text id="2"></text></binding></visual></tile>',
        [TileTemplateType.tileWide310x150Text01]:
            '<tile><visual version="4"><binding template="TileWide310x150Text01" fallback="TileWideText01"><text id="1"></text><text id="2"></text><text id="3"></text><text id="4"></text><text id="5"></text></binding></visual></tile>',
        [TileTemplateType.tileWide310x150Text02]:
            '<tile><visual version="4"><binding template="TileWide310x150Text02" fallback="TileWideText02"><text id="1"></text><text id="2"></text><text id="3"></text><text id="4"></text><text id="5"></text><text id="6"></text><text id="7"></text><text id="8"></text><text id="9"></text></binding></visual></tile>',
        [TileTemplateType.tileWide310x150Text03]:
            '<tile><visual version="4"><binding template="TileWide310x150Text03" fallback="TileWideText03"><text id="1"></text></binding></visual></tile>',
        [TileTemplateType.tileWide310x150Text04]:
            '<tile><visual version="4"><binding template="TileWide310x150Text04" fallback="TileWideText04"><text id="1"></text></binding></visual></tile>',
        [TileTemplateType.tileWide310x150Text05]:
            '<tile><visual version="4"><binding template="TileWide310x150Text05" fallback="TileWideText05"><text id="1"></text><text id="2"></text><text id="3"></text><text id="4"></text><text id="5"></text></binding></visual></tile>',
        [TileTemplateType.tileWide310x150Text06]:
            '<tile><visual version="4"><binding template="TileWide310x150Text06" fallback="TileWideText06"><text id="1"></text><text id="2"></text><text id="3"></text><text id="4"></text><text id="5"></text><text id="6"></text><text id="7"></text><text id="8"></text><text id="9"></text><text id="10"></text></binding></visual></tile>',
        [TileTemplateType.tileWide310x150Text07]:
            '<tile><visual version="4"><binding template="TileWide310x150Text07" fallback="TileWideText07"><text id="1"></text><text id="2"></text><text id="3"></text><text id="4"></text><text id="5"></text><text id="6"></text><text id="7"></text><text id="8"></text><text id="9"></text></binding></visual></tile>',
        [TileTemplateType.tileWide310x150Text08]:
            '<tile><visual version="4"><binding template="TileWide310x150Text08" fallback="TileWideText08"><text id="1"></text><text id="2"></text><text id="3"></text><text id="4"></text><text id="5"></text><text id="6"></text><text id="7"></text><text id="8"></text><text id="9"></text><text id="10"></text></binding></visual></tile>',
        [TileTemplateType.tileWide310x150Text09]:
            '<tile><visual version="4"><binding template="TileWide310x150Text09" fallback="TileWideText09"><text id="1"></text><text id="2"></text></binding></visual></tile>',
        [TileTemplateType.tileWide310x150Text10]:
            '<tile><visual version="4"><binding template="TileWide310x150Text10" fallback="TileWideText10"><text id="1"></text><text id="2"></text><text id="3"></text><text id="4"></text><text id="5"></text><text id="6"></text><text id="7"></text><text id="8"></text><text id="9"></text></binding></visual></tile>',
        [TileTemplateType.tileWide310x150Text11]:
            '<tile><visual version="4"><binding template="TileWide310x150Text11" fallback="TileWideText11"><text id="1"></text><text id="2"></text><text id="3"></text><text id="4"></text><text id="5"></text><text id="6"></text><text id="7"></text><text id="8"></text><text id="9"></text><text id="10"></text></binding></visual></tile>',
        [TileTemplateType.tileSquare310x310BlockAndText01]:
            '<tile><visual version="4"><binding template="TileSquare310x310BlockAndText01"><text id="1"></text><text id="2"></text><text id="3"></text><text id="4"></text><text id="5"></text><text id="6"></text><text id="7"></text><text id="8"></text><text id="9"></text></binding></visual></tile>',
        [TileTemplateType.tileSquare310x310BlockAndText02]:
            '<tile><visual version="4"><binding template="TileSquare310x310BlockAndText02"><image id="1" src=""/><text id="1"></text><text id="2"></text><text id="3"></text><text id="4"></text><text id="5"></text><text id="6"></text><text id="7"></text></binding></visual></tile>',
        [TileTemplateType.tileSquare310x310Image]:
            '<tile><visual version="4"><binding template="TileSquare310x310Image"><image id="1" src=""/></binding></visual></tile>',
        [TileTemplateType.tileSquare310x310ImageAndText01]:
            '<tile><visual version="4"><binding template="TileSquare310x310ImageAndText01"><image id="1" src=""/><text id="1"></text></binding></visual></tile>',
        [TileTemplateType.tileSquare310x310ImageAndText02]:
            '<tile><visual version="4"><binding template="TileSquare310x310ImageAndText02"><image id="1" src=""/><text id="1"></text><text id="2"></text></binding></visual></tile>',
        [TileTemplateType.tileSquare310x310ImageAndTextOverlay01]:
            '<tile><visual version="4"><binding template="TileSquare310x310ImageAndTextOverlay01"><image id="1" src=""/><text id="1"></text></binding></visual></tile>',
        [TileTemplateType.tileSquare310x310ImageAndTextOverlay02]:
            '<tile><visual version="4"><binding template="TileSquare310x310ImageAndTextOverlay02"><image id="1" src=""/><text id="1"></text><text id="2"></text></binding></visual></tile>',
        [TileTemplateType.tileSquare310x310ImageAndTextOverlay03]:
            '<tile><visual version="4"><binding template="TileSquare310x310ImageAndTextOverlay03"><image id="1" src=""/><text id="1"></text><text id="2"></text><text id="3"></text><text id="4"></text></binding></visual></tile>',
        [TileTemplateType.tileSquare310x310ImageCollectionAndText01]:
            '<tile><visual version="4"><binding template="TileSquare310x310ImageCollectionAndText01"><image id="1" src=""/><image id="2" src=""/><image id="3" src=""/><image id="4" src=""/><image id="5" src=""/><text id="1"></text></binding></visual></tile>',
        [TileTemplateType.tileSquare310x310ImageCollectionAndText02]:
            '<tile><visual version="4"><binding template="TileSquare310x310ImageCollectionAndText02"><image id="1" src=""/><image id="2" src=""/><image id="3" src=""/><image id="4" src=""/><image id="5" src=""/><text id="1"></text><text id="2"></text></binding></visual></tile>',
        [TileTemplateType.tileSquare310x310ImageCollection]:
            '<tile><visual version="4"><binding template="TileSquare310x310ImageCollection"><image id="1" src=""/><image id="2" src=""/><image id="3" src=""/><image id="4" src=""/><image id="5" src=""/></binding></visual></tile>',
        [TileTemplateType.tileSquare310x310SmallImagesAndTextList01]:
            '<tile><visual version="4"><binding template="TileSquare310x310SmallImagesAndTextList01"><image id="1" src=""/><image id="2" src=""/><image id="3" src=""/><text id="1"></text><text id="2"></text><text id="3"></text><text id="4"></text><text id="5"></text><text id="6"></text><text id="7"></text><text id="8"></text><text id="9"></text></binding></visual></tile>',
        [TileTemplateType.tileSquare310x310SmallImagesAndTextList02]:
            '<tile><visual version="4"><binding template="TileSquare310x310SmallImagesAndTextList02"><image id="1" src=""/><image id="2" src=""/><image id="3" src=""/><text id="1"></text><text id="2"></text><text id="3"></text></binding></visual></tile>',
        [TileTemplateType.tileSquare310x310SmallImagesAndTextList03]:
            '<tile><visual version="4"><binding template="TileSquare310x310SmallImagesAndTextList03"><image id="1" src=""/><image id="2" src=""/><image id="3" src=""/><text id="1"></text><text id="2"></text><text id="3"></text><text id="4"></text><text id="5"></text><text id="6"></text></binding></visual></tile>',
        [TileTemplateType.tileSquare310x310SmallImagesAndTextList04]:
            '<tile><visual version="4"><binding template="TileSquare310x310SmallImagesAndTextList04"><image id="1" src=""/><image id="2" src=""/><image id="3" src=""/><text id="1"></text><text id="2"></text><text id="3"></text><text id="4"></text><text id="5"></text><text id="6"></text></binding></visual></tile>',
        [TileTemplateType.tileSquare310x310Text01]:
            '<tile><visual version="4"><binding template="TileSquare310x310Text01"><text id="1"></text><text id="2"></text><text id="3"></text><text id="4"></text><text id="5"></text><text id="6"></text><text id="7"></text><text id="8"></text><text id="9"></text><text id="10"></text></binding></visual></tile>',
        [TileTemplateType.tileSquare310x310Text02]:
            '<tile><visual version="4"><binding template="TileSquare310x310Text02"><text id="1"></text><text id="2"></text><text id="3"></text><text id="4"></text><text id="5"></text><text id="6"></text><text id="7"></text><text id="8"></text><text id="9"></text><text id="10"></text><text id="11"></text><text id="12"></text><text id="13"></text><text id="14"></text><text id="15"></text><text id="16"></text><text id="17"></text><text id="18"></text><text id="19"></text></binding></visual></tile>',
        [TileTemplateType.tileSquare310x310Text03]:
            '<tile><visual version="4"><binding template="TileSquare310x310Text03"><text id="1"></text><text id="2"></text><text id="3"></text><text id="4"></text><text id="5"></text><text id="6"></text><text id="7"></text><text id="8"></text><text id="9"></text><text id="10"></text><text id="11"></text></binding></visual></tile>',
        [TileTemplateType.tileSquare310x310Text04]:
            '<tile><visual version="4"><binding template="TileSquare310x310Text04"><text id="1"></text><text id="2"></text><text id="3"></text><text id="4"></text><text id="5"></text><text id="6"></text><text id="7"></text><text id="8"></text><text id="9"></text><text id="10"></text><text id="11"></text><text id="12"></text><text id="13"></text><text id="14"></text><text id="15"></text><text id="16"></text><text id="17"></text><text id="18"></text><text id="19"></text><text id="20"></text><text id="21"></text><text id="22"></text></binding></visual></tile>',
        [TileTemplateType.tileSquare310x310Text05]:
            '<tile><visual version="4"><binding template="TileSquare310x310Text05"><text id="1"></text><text id="2"></text><text id="3"></text><text id="4"></text><text id="5"></text><text id="6"></text><text id="7"></text><text id="8"></text><text id="9"></text><text id="10"></text><text id="11"></text><text id="12"></text><text id="13"></text><text id="14"></text><text id="15"></text><text id="16"></text><text id="17"></text><text id="18"></text><text id="19"></text></binding></visual></tile>',
        [TileTemplateType.tileSquare310x310Text06]:
            '<tile><visual version="4"><binding template="TileSquare310x310Text06"><text id="1"></text><text id="2"></text><text id="3"></text><text id="4"></text><text id="5"></text><text id="6"></text><text id="7"></text><text id="8"></text><text id="9"></text><text id="10"></text><text id="11"></text><text id="12"></text><text id="13"></text><text id="14"></text><text id="15"></text><text id="16"></text><text id="17"></text><text id="18"></text><text id="19"></text><text id="20"></text><text id="21"></text><text id="22"></text></binding></visual></tile>',
        [TileTemplateType.tileSquare310x310Text07]:
            '<tile><visual version="4"><binding template="TileSquare310x310Text07"><text id="1"></text><text id="2"></text><text id="3"></text><text id="4"></text><text id="5"></text><text id="6"></text><text id="7"></text><text id="8"></text><text id="9"></text><text id="10"></text><text id="11"></text><text id="12"></text><text id="13"></text><text id="14"></text><text id="15"></text><text id="16"></text><text id="17"></text><text id="18"></text><text id="19"></text></binding></visual></tile>',
        [TileTemplateType.tileSquare310x310Text08]:
            '<tile><visual version="4"><binding template="TileSquare310x310Text08"><text id="1"></text><text id="2"></text><text id="3"></text><text id="4"></text><text id="5"></text><text id="6"></text><text id="7"></text><text id="8"></text><text id="9"></text><text id="10"></text><text id="11"></text><text id="12"></text><text id="13"></text><text id="14"></text><text id="15"></text><text id="16"></text><text id="17"></text><text id="18"></text><text id="19"></text><text id="20"></text><text id="21"></text><text id="22"></text></binding></visual></tile>',
        [TileTemplateType.tileSquare310x310TextList01]:
            '<tile><visual version="4"><binding template="TileSquare310x310TextList01"><text id="1"></text><text id="2"></text><text id="3"></text><text id="4"></text><text id="5"></text><text id="6"></text><text id="7"></text><text id="8"></text><text id="9"></text></binding></visual></tile>',
        [TileTemplateType.tileSquare310x310TextList02]:
            '<tile><visual version="4"><binding template="TileSquare310x310TextList02"><text id="1"></text><text id="2"></text><text id="3"></text></binding></visual></tile>',
        [TileTemplateType.tileSquare310x310TextList03]:
            '<tile><visual version="4"><binding template="TileSquare310x310TextList03"><text id="1"></text><text id="2"></text><text id="3"></text><text id="4"></text><text id="5"></text><text id="6"></text></binding></visual></tile>',
        [TileTemplateType.tileSquare310x310SmallImageAndText01]:
            '<tile><visual version="4"><binding template="TileSquare310x310SmallImageAndText01"><image id="1" src=""/><text id="1"></text><text id="2"></text><text id="3"></text></binding></visual></tile>',
        [TileTemplateType.tileSquare310x310SmallImagesAndTextList05]:
            '<tile><visual version="4"><binding template="TileSquare310x310SmallImagesAndTextList05"><image id="1" src=""/><image id="2" src=""/><image id="3" src=""/><text id="1"></text><text id="2"></text><text id="3"></text><text id="4"></text><text id="5"></text><text id="6"></text><text id="7"></text></binding></visual></tile>',
        [TileTemplateType.tileSquare310x310Text09]:
            '<tile><visual version="4"><binding template="TileSquare310x310Text09"><text id="1"></text><text id="2"></text><text id="3"></text><text id="4"></text><text id="5"></text></binding></visual></tile>',
    };

    static getTemplateContent(type: TileTemplateType): Document {
        return new xmldom.DOMParser().parseFromString(
            TileUpdateManager.TEMPLATE_MAP[type],
            'text/xml',
        );
    }
}
